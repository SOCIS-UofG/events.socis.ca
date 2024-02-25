import { Prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";
import { type Event } from "@/types/event";
import config from "@/lib/config/event.config";
import { v4 as uuidv4 } from "uuid";
import uploadFile from "./utils/upload";
import { del } from "@vercel/blob";

export const eventsRouter = {
  /**
   * Add an event to the events database
   *
   * @param input - The input object
   * @param input.event - The event to add
   */
  createEvent: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        event: z.object({
          id: z.string().optional(),
          name: z
            .string()
            .max(config.event.max.name)
            .min(config.event.min.name),
          description: z
            .string()
            .max(config.event.max.description)
            .min(config.event.min.description),
          date: z
            .string()
            .max(config.event.max.date)
            .min(config.event.min.date),
          location: z
            .string()
            .max(config.event.max.location)
            .min(config.event.min.location),
          image: z.string().optional(),
          perks: z.array(z.string()).optional(),
          rsvps: z.array(z.string()).optional(),
          pinned: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, event: null };
      }

      if (!hasPermissions(user, [Permission.CREATE_EVENT])) {
        return { success: false, event: null };
      }

      // Mutable image variable
      let eventImage = input.event.image;

      /**
       * Upload the image to the blob storage
       */
      if (eventImage) {
        const blob = await uploadFile(
          null /* denotes no previous image */,
          eventImage,
        );
        if (!blob) {
          return { message: "Internal error", user: null, success: false };
        }

        eventImage = blob.url;
      }

      const event = input.event as Event;
      const generatedId = event.id || uuidv4();
      const newEvent = await Prisma.createEvent({
        id: generatedId,
        name: event.name,
        description: event.description,
        date: event.date,
        location: event.location,
        image: eventImage ?? config.event.default.image,
        perks: event.perks ?? config.event.default.perks,
        rsvps: event.rsvps ?? config.event.default.rsvps,
        pinned: event.pinned ?? config.event.default.pinned,
      });

      if (!newEvent) {
        return { success: false, event: null };
      }

      return { success: true, event: newEvent };
    }),

  /**
   * Delete an event from the events database
   *
   * @param input - The input object
   * @param input.id - The id of the event to delete
   * @returns The deleted event
   */
  deleteEvent: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, event: null };
      }

      if (!hasPermissions(user, [Permission.DELETE_EVENT])) {
        return { success: false, event: null };
      }

      // if the event is not found, return null
      const event = await Prisma.getEventById(input.id);
      if (!event) {
        return { success: false, event: null };
      }

      // delete the event image if it is not the default image
      if (event.image && event.image !== config.event.default.image) {
        try {
          await del(event.image);
        } catch (e) {
          console.log(e);

          return { success: false, event: null };
        }
      }

      const deletedEvent = await Prisma.deleteEventById(input.id);
      if (!deletedEvent) {
        return { success: false, event: null };
      }

      return { success: true, event: deletedEvent };
    }),

  /**
   * Update an event in the events database
   *
   * @param input - The input object
   * @param input.event - The event to update
   * @returns The updated event
   */
  updateEvent: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        event: z.object({
          id: z.string(),
          name: z
            .string()
            .max(config.event.max.name)
            .min(config.event.min.name),
          description: z
            .string()
            .max(config.event.max.description)
            .min(config.event.min.description),
          date: z
            .string()
            .max(config.event.max.date)
            .min(config.event.min.date),
          location: z
            .string()
            .max(config.event.max.location)
            .min(config.event.min.location),
          image: z.string().optional(),
          perks: z.array(z.string()).optional(),
          rsvps: z.array(z.string()).optional(),
          pinned: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await Prisma.getUserBySecretNoPassword(input.accessToken);
      if (!user) {
        return { success: false, event: null };
      }

      if (!hasPermissions(user, [Permission.EDIT_EVENT])) {
        return { success: false, event: null };
      }

      // get the event
      const prevEvent = await Prisma.getEventById(input.event.id);
      if (!prevEvent) {
        return { success: false, event: null };
      }

      // Mutable image variable
      let eventImage = input.event.image;

      /**
       * Upload the image to the blob storage
       */
      if (eventImage) {
        const blob = await uploadFile(prevEvent.image, eventImage);
        if (!blob) {
          return { message: "Internal error", user: null, success: false };
        }

        eventImage = blob.url;
      }

      const event = input.event as Event;
      const updatedEvent = await Prisma.updateEventById(event.id, {
        name: event.name,
        description: event.description,
        date: event.date,
        location: event.location,
        image: eventImage ?? config.event.default.image,
        perks: event.perks ?? config.event.default.perks,
        rsvps: event.rsvps ?? config.event.default.rsvps,
        pinned: event.pinned ?? config.event.default.pinned,
      } as Event);

      if (!updatedEvent) {
        return { success: false, event: null };
      }

      return { success: true, event: updatedEvent };
    }),

  /**
   * Get all of the events
   *
   * @returns The events
   */
  getAllEvents: publicProcedure.mutation(async () => {
    const events = await Prisma.getAllEvents();

    return { success: true, events };
  }),

  /**
   * Get an event by its id
   *
   * @param input - The input object
   * @param input.id - The id of the event to get
   * @returns The event
   */
  getEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const event = await Prisma.getEventById(input.id);
      if (!event) {
        return { success: false, event: null };
      }

      return { success: true, event };
    }),
};

import { Prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { type Event } from "@/types/event";
import config from "@/lib/config/event.config";
import { v4 as uuidv4 } from "uuid";
import uploadFile from "./utils/uploadFile";
import { del } from "@vercel/blob";

export const eventsRouter = {
  /**
   * Add an event to the events database
   *
   * @returns The new event
   */
  createEvent: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        event: z.object({
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
        throw new Error("Unauthorized");
      }

      if (!hasPermissions(user, [Permission.CREATE_EVENT])) {
        throw new Error("Unauthorized");
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
          throw new Error("Internal error");
        }

        eventImage = blob.url;
      }

      const event = input.event as Event;
      const newEvent = await Prisma.createEvent({
        id: uuidv4(),
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
        throw new Error("Internal error");
      }

      return { event: newEvent };
    }),

  /**
   * Delete an event from the events database
   *
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
        throw new Error("Unauthorized");
      }

      if (!hasPermissions(user, [Permission.DELETE_EVENT])) {
        throw new Error("Unauthorized");
      }

      // if the event is not found, return null
      const event = await Prisma.getEventById(input.id);
      if (!event) {
        throw new Error("Event not found");
      }

      // delete the event image if it is not the default image
      if (event.image && event.image !== config.event.default.image) {
        try {
          await del(event.image);
        } catch (e) {
          throw new Error("Internal error");
        }
      }

      const deletedEvent = await Prisma.deleteEventById(input.id);
      if (!deletedEvent) {
        throw new Error("Internal error");
      }

      return { event: deletedEvent };
    }),

  /**
   * Update an event in the events database
   *
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
            .min(config.event.min.name)
            .optional(),
          description: z
            .string()
            .max(config.event.max.description)
            .min(config.event.min.description)
            .optional(),
          date: z
            .string()
            .max(config.event.max.date)
            .min(config.event.min.date)
            .optional(),
          location: z
            .string()
            .max(config.event.max.location)
            .min(config.event.min.location)
            .optional(),
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
        throw new Error("Unauthorized");
      }

      if (!hasPermissions(user, [Permission.EDIT_EVENT])) {
        throw new Error("Unauthorized");
      }

      // get the event
      const prevEvent = await Prisma.getEventById(input.event.id);
      if (!prevEvent) {
        throw new Error("Event not found");
      }

      // Mutable image variable
      let eventImage = input.event.image;

      /**
       * Upload the image to the blob storage
       */
      if (eventImage) {
        const blob = await uploadFile(prevEvent.image, eventImage);

        if (!blob) {
          throw new Error("Error uploading image");
        }

        eventImage = blob.url;
      } else {
        eventImage = config.event.default.image;
      }

      const event = input.event as Event;
      const updatedEvent = await Prisma.updateEventById(event.id, {
        image: eventImage,

        // this can definitely be cleaned up
        name: event.name ?? config.event.default.name,
        description: event.description ?? config.event.default.description,
        date: event.date ?? config.event.default.date,
        location: event.location ?? config.event.default.location,
        perks: event.perks ?? config.event.default.perks,
        rsvps: event.rsvps ?? config.event.default.rsvps,
        pinned: event.pinned ?? config.event.default.pinned,
      } as Event);

      if (!updatedEvent) {
        throw new Error("Failed to update event");
      }

      return { event: updatedEvent };
    }),

  /**
   * Get all of the events
   *
   * @returns The events
   */
  getAllEvents: publicProcedure.mutation(async () => {
    const events = await Prisma.getAllEvents();

    return { events };
  }),

  /**
   * Get an event by its id
   *
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
        throw new Error("Event not found");
      }

      return { event };
    }),
};

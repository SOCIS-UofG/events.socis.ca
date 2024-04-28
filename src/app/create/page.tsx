"use client";

import { type FormEvent, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Session } from "next-auth";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { useRouter } from "next/navigation";
import { type Event } from "@/types/event";
import { isValidEventData } from "@/lib/utils/events";
import {
  Button,
  Checkbox,
  Input,
  NextUIProvider,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import config from "@/lib/config/event.config";
import { trpc } from "@/lib/trpc/client";
import { type FormStatus } from "@/types";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import MainWrapper from "@/components/ui/global/MainWrapper";
import Link from "next/link";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function EventCreationPage(): JSX.Element {
  return (
    <NextUIProvider>
      <Navbar />
      <CustomCursor />

      <SessionProvider>
        <Components />
      </SessionProvider>
    </NextUIProvider>
  );
}

/**
 * The main components for the events page. These are to be wrapped in a session provider
 * for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const { mutateAsync: createEvent } = trpc.createEvent.useMutation();

  const [creationStatus, setCreationStatus] = useState<FormStatus>("idle");
  const [event, setEvent] = useState<Event>(config.event.default as Event);

  /**
   * If the event is being created, the user is not authenticated, or the
   * default event hasn't been generated (undefined), then return a loading
   * screen.
   */
  if (sessionStatus === "loading" || creationStatus === "loading" || !event) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * Check if the user is authenticated.
   *
   * If the user is not authenticated, then return an invalid session component.
   */
  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Session
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            Please sign in to proceed.
          </p>
          <Button
            className="btn"
            as={Link}
            color="primary"
            href="https://auth.socis.ca/signin"
          >
            Sign in
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Check if the user has the permissions to create an event.
   *
   * If the user does not have the permissions, then return an invalid permissions component.
   */
  if (!hasPermissions(session.user, [Permission.CREATE_EVENT])) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            You do not have the permissions to manage events.
          </p>
          <Button
            className="btn"
            as={Link}
            color="primary"
            href="https://auth.socis.ca/signin"
          >
            Switch accounts
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Handle the form submission.
   *
   * @param e The form event.
   * @param event The event to create.
   * @param session The session of the user editing the event
   * @returns Promise<void>
   */
  async function onSubmit(
    formEvent: FormEvent<HTMLFormElement>,
    event: Event,
    session: Session,
  ): Promise<void> {
    /**
     * Prevent the default form submission.
     */
    formEvent.preventDefault();

    /**
     * Set the status to loading so that the user knows that the event is being created.
     */
    setCreationStatus("loading");

    /**
     * If the provideed data for the event being created is invalid, then
     * return an error message. This is so that empty events are not created.
     */
    if (!isValidEventData(event)) {
      setCreationStatus("empty_fields");

      return;
    }

    /**
     * Create the event using the API.
     */
    await createEvent({
      accessToken: session.user.secret,
      event,
    })
      .then(() => {
        setCreationStatus("success");
        router.push("/next-steps");
      })
      .catch(() => {
        setCreationStatus("error");
      });
  }

  /**
   * Return the main components for the events page.
   */
  return (
    <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center gap-5 p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col items-start justify-start gap-5"
        onSubmit={async (e) => onSubmit(e, event, session)}
      >
        {/** HEADER */}
        <h1 className="mb-2 text-5xl uppercase text-white md:text-7xl">
          Create Event
        </h1>

        {/**
         * EVENT NAME
         *
         * The user can add a name to the event.
         * This will be displayed on the event page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Name</label>
          <Input
            className="w-full"
            maxLength={config.event.max.name}
            minLength={config.event.min.name}
            label="Name"
            placeholder="Name"
            type="text"
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
          />
        </div>

        {/**
         * EVENT DESCRIPTION
         *
         * The user can add a description to the event.
         * This will be displayed on the event page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Description</label>
          <Textarea
            className="w-full"
            maxLength={config.event.max.description}
            minLength={config.event.min.description}
            label="Description"
            placeholder="Description"
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
          />
        </div>

        {/**
         * EVENT LOCATION
         *
         * The user can add a location to the event.
         * This will be displayed on the event page.
         * The location is not validated and is a string -- the user can input anything.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Location</label>
          <Input
            className="w-full"
            maxLength={config.event.max.location}
            minLength={config.event.min.location}
            label="Location"
            placeholder="Location"
            type="text"
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
          />
        </div>

        {/**
         * EVENT DATE
         *
         * The user can add a date to the event.
         * This will be displayed on the event page.
         * The date is not validated and is a string -- the user can input anything.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Date</label>
          <Input
            className="w-full"
            maxLength={config.event.max.date}
            minLength={config.event.min.date}
            label="Date"
            placeholder="Date"
            type="date"
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
          />
        </div>

        {/**
         * EVENT PERKS
         *
         * The user can add perks to the event.
         * These perks will be displayed on the event page.
         * The perks are seperated by commas.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Perks</label>
          <Input
            className="w-full"
            maxLength={config.event.max.perksInput}
            minLength={config.event.min.perks}
            label="Perks"
            placeholder="Perks (Seperate by comma)"
            type="text"
            onChange={(e) => {
              const perks = e.target.value
                .split(",")
                .map((perk) => perk.trim());

              setEvent({
                ...event,
                perks: perks.slice(0, config.event.max.perks),
              });
            }}
          />
        </div>

        {/**
         * EVENT IMAGE
         *
         * The user can add an image to the event.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="mb-2 mt-5 text-white">Event Image</label>
          <Input
            className="w-full"
            placeholder="Image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files) {
                return;
              }

              const file = e.target.files[0];
              if (!file) {
                return;
              }

              // verify image is less than 5mb
              if (file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5mb");
                return;
              }

              const reader = new FileReader();

              reader.onloadend = () => {
                const image = reader.result as string;

                setEvent({ ...event, image });
              };

              reader.readAsDataURL(file);
            }}
          />
        </div>

        {/**
         * PIN EVENT
         *
         * The user can pin the event to the top of the events page.
         * This will make the event appear at the top of the events page.
         */}
        <Checkbox
          isSelected={event.pinned}
          onChange={(e) => setEvent({ ...event, pinned: e.target.checked })}
        >
          <p className="text-white">Pin Event</p>
        </Checkbox>

        <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">
          {/**
           * CREATE EVENT
           *
           * Once the user is finished creating the event, they can submit it.
           * This will send an http request to the API and create the event.
           * If the user hasn't filled in all the fields, then the event will not be created
           * and an error message will be displayed.
           */}
          <Button className="btn w-full" color="primary" type="submit">
            Create Event
          </Button>

          {/**
           * If the user doesn't want to create the event, then they can cancel.
           *
           * This will just redirect them back to the events page.
           */}
          <Button
            className="btn w-full lg:w-1/2"
            as={Link}
            color="default"
            href="/"
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-5 flex w-full flex-col items-center justify-center gap-5">
        {/**
         * If the event was successfully created, then display a success message.
         *
         * This will appear before the user is redirected to the /next-steps page.
         */}
        {creationStatus === "success" && (
          <p className="text-primary">Event created successfully.</p>
        )}

        {/**
         * If the event was not successfully created, then display an error message.
         *
         * The user will have the chance to input the data again.
         */}
        {creationStatus === "error" && (
          <p className="text-red-500">An error occurred. Please try again.</p>
        )}

        {/**
         * If the user hasn't filled in all the fields, then display an error message.
         *
         * The user will have the chance to input the data again.
         */}
        {creationStatus === "empty_fields" && (
          <p className="text-red-500">Please fill in all the fields.</p>
        )}
      </div>
    </MainWrapper>
  );
}

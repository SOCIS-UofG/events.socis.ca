"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { type Event } from "@/types/event";
import { type Session } from "next-auth";
import config from "@/lib/config/event.config";
import { isValidEventData } from "@/lib/utils/events";
import {
  Button,
  Checkbox,
  Input,
  NextUIProvider,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { trpc } from "@/lib/trpc/client";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { type FormStatus } from "@/types";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import MainWrapper from "@/components/ui/global/MainWrapper";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function UpdateEventsPage(): JSX.Element {
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
 * The main components for the update events page. These are to be wrapped in a
 * session provider for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<FormStatus>("idle");
  const [fetchStatus, setFetchStatus] = useState<FormStatus>("needs_fetch");

  const { mutateAsync: getEvent } = trpc.getEvent.useMutation();
  const { mutateAsync: updateEvent } = trpc.updateEvent.useMutation();

  /**
   * Get the event id from the url.
   */
  const path = usePathname();
  const eventId = path.split("/")[2];

  /**
   * Once the page loads, we want to fetch the event data so that we can
   * modify the existing event contents.
   */
  useEffect(() => {
    /**
     * If the event id is invalid or we are already fetching the event data,
     * then don't fetch the event data again.
     */
    if (!eventId || fetchStatus !== "needs_fetch") {
      return;
    }

    /**
     * Set the fetch status to loading so that we don't fetch the event again and
     * can display a loading screen to the user.
     */
    setFetchStatus("loading");

    /**
     * Fetch the event data from the database.
     */
    getEvent({ id: eventId })
      .then((res) => {
        setEvent(res.event);
        setFetchStatus("success");
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }, []);

  /**
   *
   * @param formEvent The form event
   * @param event The event that the user is updating
   * @param session The current session (next auth)
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
    setEditStatus("loading");

    /**
     * If the provideed data for the event being created is invalid, then
     * return an error message. This is so that empty events are not created.
     */
    if (!isValidEventData(event)) {
      setEditStatus("empty_fields");

      return;
    }

    /**
     * Update the event in the database.
     */
    await updateEvent({ accessToken: session.user.secret, event })
      .then(() => {
        setFetchStatus("success");
        router.push("/");
      })
      .catch(() => {
        setFetchStatus("error");
      });
  }

  /**
   * If we are currently signing the user in, the event is invalid,
   * or we are still fetching the event data, show a loading screen.
   */
  if (
    !event ||
    sessionStatus === "loading" ||
    fetchStatus === "loading" ||
    editStatus === "loading"
  ) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * If the provided event id (from the url parameters) is invalid, then show an error message.
   */
  if (!eventId) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Event
        </h1>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The event that you provided is invalid.
          </p>

          <Button className="btn" as={Link} color="primary" href="/">
            Go back
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If there was an error fetching the event data, then show an error message.
   */
  if (fetchStatus === "error") {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Server Error
        </h1>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            There was an error fetching the event data.
          </p>

          <Button className="btn" as={Link} color="primary" href="/">
            Go back
          </Button>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If the user is not signed in, then show an error message.
   */
  if (sessionStatus !== "authenticated") {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Session
        </h1>

        <div className="flex w-full flex-col items-center justify-center gap-5">
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
   * Check if the user has the permissions to edit an event.
   *
   * If the user does not have the permissions, then return an invalid permissions component.
   */
  if (!hasPermissions(session.user, [Permission.EDIT_EVENT])) {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex w-full flex-col items-center justify-center gap-5">
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

  return (
    <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center gap-5 p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col items-start justify-start gap-5"
        onSubmit={async (e) => onSubmit(e, event, session)}
      >
        <h1 className="mb-2 text-5xl font-normal uppercase text-white md:text-7xl">
          Update Event
        </h1>

        {/**
         * EVENT NAME
         *
         * The user can set the name of the event. This will be displayed on the event page.
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
            value={event.name}
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
          />
        </div>

        {/**
         * EVENT DESCRIPTION
         *
         * The user can set the description of the event. This will be displayed on the event page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Description</label>
          <Textarea
            className="w-full"
            maxLength={config.event.max.description}
            minLength={config.event.min.description}
            label="Description"
            placeholder="Description"
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
          />
        </div>

        {/**
         * EVENT LOCATION
         *
         * The user can set the location of the event. This will be displayed on the event page.
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
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
          />
        </div>

        {/**
         * EVENT DATE
         *
         * The user can set the date of the event. This will be displayed on the event page.
         * The event date is not validated and is a string -- the user can enter anything.
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
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
          />
        </div>

        {/**
         * EVENT PERKS
         *
         * The user can add perks to the event. These perks will be displayed
         * on the event page.
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
            value={event.perks.join(",")}
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
         * The user can set the image of the event. This will be displayed on the event page.
         */}
        <div className="flex w-full flex-col items-start justify-start gap-2">
          <label className="text-white">Event Image</label>
          <Input
            className="w-full"
            placeholder="Image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return setEvent({
                  ...event,
                  image: config.event.default.image,
                });
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
        <div className="flex flex-wrap gap-2">
          <Checkbox
            className="text-white"
            isSelected={event.pinned}
            onChange={(e) => setEvent({ ...event, pinned: e.target.checked })}
          >
            Pin Event
          </Checkbox>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
          <Button className="btn w-full" color="primary" type="submit">
            Update Event
          </Button>
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

      <div className="mt-5 flex flex-col items-center justify-center gap-5">
        {editStatus === "success" && (
          <p className="text-primary">Event updated successfully.</p>
        )}

        {editStatus === "error" && (
          <p className="text-red-500">There was an error updating the event.</p>
        )}

        {editStatus === "empty_fields" && (
          <p className="text-red-500">Please fill in all the fields.</p>
        )}
      </div>
    </MainWrapper>
  );
}

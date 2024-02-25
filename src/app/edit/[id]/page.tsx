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
import { Checkbox } from "@nextui-org/react";
import {
  Button,
  CustomCursor,
  ErrorMessage,
  LinkButton,
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  SuccessMessage,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";

/**
 * The status of the form.
 */
enum FormStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
  EMPTY_FIELDS,
  NEED_FETCH,
}

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function UpdateEventsPage(): JSX.Element {
  return (
    <>
      <Navbar />
      <CustomCursor />

      <SessionProvider>
        <Components />
      </SessionProvider>
    </>
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
  const [editStatus, setEditStatus] = useState(FormStatus.IDLE);
  const [fetchStatus, setFetchStatus] = useState(FormStatus.NEED_FETCH);
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
    if (!eventId || fetchStatus !== FormStatus.NEED_FETCH) {
      return;
    }

    /**
     * Set the fetch status to loading so that we don't fetch the event again and
     * can display a loading screen to the user.
     */
    setFetchStatus(FormStatus.LOADING);

    /**
     * Fetch the event data from the database.
     */
    getEvent({ id: eventId })
      .then((data) => {
        if (!data.event) {
          setFetchStatus(FormStatus.ERROR);
          return;
        }

        setEvent(data.event);
        setFetchStatus(FormStatus.SUCCESS);
      })
      .catch(() => {
        setFetchStatus(FormStatus.ERROR);
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
    setEditStatus(FormStatus.LOADING);

    /**
     * If the provideed data for the event being created is invalid, then
     * return an error message. This is so that empty events are not created.
     */
    if (!isValidEventData(event)) {
      setEditStatus(FormStatus.EMPTY_FIELDS);

      return;
    }

    /**
     * Update the event in the database.
     */
    const res = await updateEvent({ accessToken: session.user.secret, event });

    /**
     * If the event was successfully updated, then set the status to success.
     */
    if (res.success) {
      setEditStatus(FormStatus.SUCCESS);

      /**
       * Redirect the user to the events page.
       */
      router.push("/");
    }
  }

  /**
   * If the provided event id (from the url parameters) is invalid, then show an error message.
   */
  if (!eventId) {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Event
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The event that you provided is invalid.
          </p>
          <Link
            href="/"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Go back
          </Link>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If we are currently signing the user in, the event is invalid,
   * or we are still fetching the event data, show a loading screen.
   */
  if (
    !event ||
    sessionStatus === "loading" ||
    fetchStatus === FormStatus.LOADING ||
    editStatus === FormStatus.LOADING
  ) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the user is not signed in, then show an error message.
   */
  if (sessionStatus !== "authenticated") {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Session
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            Please sign in to proceed.
          </p>
          <a
            href="https://auth.socis.ca/signin"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Sign in
          </a>
        </div>
      </MainWrapper>
    );
  }

  /**
   * If there was an error with fetching the event, show an error message.
   */
  if (fetchStatus === FormStatus.ERROR) {
    return (
      <MainWrapper>
        <ErrorMessage>
          There was an error fetching the event. Please try again later.
        </ErrorMessage>
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
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Permissions
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            You do not have the permissions to manage events.
          </p>
          <a
            href="https://auth.socis.ca/signin"
            className="rounded-lg border border-primary px-10 py-3 text-center font-thin text-white hover:bg-emerald-900/50"
          >
            Switch accounts
          </a>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col"
        onSubmit={async (e) => onSubmit(e, event, session)}
      >
        <h1 className="mb-7 text-5xl font-thin uppercase text-white md:text-7xl">
          Update Event
        </h1>

        {/**
         * EVENT NAME
         *
         * The user can set the name of the event. This will be displayed on the event page.
         */}
        <label className="mb-2 text-white">Event Name</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.event.max.name}
          minLength={config.event.min.name}
          placeholder="Name"
          type="text"
          value={event.name}
          onChange={(e) => setEvent({ ...event, name: e.target.value })}
        />

        {/**
         * EVENT DESCRIPTION
         *
         * The user can set the description of the event. This will be displayed on the event page.
         */}
        <label className="mb-2 mt-5 text-white">Event Description</label>
        <textarea
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.event.max.description}
          minLength={config.event.min.description}
          placeholder="Description"
          value={event.description}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
        />

        {/**
         * EVENT LOCATION
         *
         * The user can set the location of the event. This will be displayed on the event page.
         */}
        <label className="mb-2 mt-5 text-white">Event Location</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.event.max.location}
          minLength={config.event.min.location}
          placeholder="Location"
          type="text"
          value={event.location}
          onChange={(e) => setEvent({ ...event, location: e.target.value })}
        />

        {/**
         * EVENT DATE
         *
         * The user can set the date of the event. This will be displayed on the event page.
         * The event date is not validated and is a string -- the user can enter anything.
         */}
        <label className="mb-2 mt-5 text-white">Event Date</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.event.max.date}
          minLength={config.event.min.date}
          placeholder="Date"
          type="date"
          value={event.date}
          onChange={(e) => setEvent({ ...event, date: e.target.value })}
        />

        {/**
         * EVENT PERKS
         *
         * The user can add perks to the event. These perks will be displayed
         * on the event page.
         */}
        <label className="mb-2 mt-5 text-white">Event Perks</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none disabled:opacity-50"
          maxLength={config.event.max.perksInput}
          minLength={config.event.min.perks}
          placeholder="Perks (Seperate by comma)"
          type="text"
          value={event.perks.join(",")}
          onChange={(e) => {
            const perks = e.target.value.split(",").map((perk) => perk.trim());

            setEvent({
              ...event,
              perks: perks.slice(0, config.event.max.perks),
            });
          }}
        />

        {/**
         * EVENT IMAGE
         *
         * The user can set the image of the event. This will be displayed on the event page.
         */}
        <label className="mb-2 mt-5 text-white">Event Image</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          placeholder="Image"
          type="file"
          onChange={(e) => {
            if (!e.target.files) {
              return;
            }

            const file = e.target.files[0];
            if (!file) {
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

        {/**
         * PIN EVENT
         *
         * The user can pin the event to the top of the events page.
         * This will make the event appear at the top of the events page.
         */}
        <div className="flex flex-wrap gap-2">
          <Checkbox
            className="mt-5 text-white"
            isSelected={event.pinned}
            onChange={(e) => setEvent({ ...event, pinned: e.target.checked })}
          >
            Pin Event
          </Checkbox>
        </div>

        <Button type="submit">Update Event</Button>
        <LinkButton href="/">Cancel</LinkButton>
      </form>

      {editStatus === FormStatus.SUCCESS && (
        <SuccessMessage>
          <p>Event updated successfully!</p>
        </SuccessMessage>
      )}

      {editStatus === FormStatus.ERROR && (
        <ErrorMessage>
          <p>There was an error creating your event.</p>
        </ErrorMessage>
      )}

      {editStatus === FormStatus.EMPTY_FIELDS && (
        <ErrorMessage>
          <p>Make sure all fields are filled in.</p>
        </ErrorMessage>
      )}
    </MainWrapper>
  );
}

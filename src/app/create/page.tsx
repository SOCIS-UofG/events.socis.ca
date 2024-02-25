"use client";

import { type FormEvent, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Session } from "next-auth";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";
import {
  ErrorMessage,
  SuccessMessage,
  MainWrapper,
  LoadingSpinnerCenter,
  CustomCursor,
  Navbar,
  LinkButton,
  Button,
} from "socis-components";
import { useRouter } from "next/navigation";
import { type Event } from "@/types/event";
import { isValidEventData } from "@/lib/utils/events";
import { Checkbox } from "@nextui-org/react";
import config from "@/lib/config/event.config";
import { trpc } from "@/lib/trpc/client";
import { v4 as uuidv4 } from "uuid";

/**
 * The status of the form.
 */
enum FormStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
  EMPTY_FIELDS,
}

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function EventCreationPage(): JSX.Element {
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
 * The main components for the events page. These are to be wrapped in a session provider
 * for next auth.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const { mutateAsync: createEvent } = trpc.createEvent.useMutation();
  const router = useRouter();

  const [creationStatus, setCreationStatus] = useState(FormStatus.IDLE);
  const [event, setEvent] = useState<Event>({
    id: uuidv4(),
    ...config.event.default,
  });

  /**
   * If the event is being created, the user is not authenticated, or the
   * default event hasn't been generated (undefined), then return a loading
   * screen.
   */
  if (
    sessionStatus === "loading" ||
    creationStatus === FormStatus.LOADING ||
    !event
  ) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * Check if the user is authenticated.
   *
   * If the user is not authenticated, then return an invalid session component.
   */
  if (sessionStatus === "unauthenticated" || !session) {
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
   * Check if the user has the permissions to create an event.
   *
   * If the user does not have the permissions, then return an invalid permissions component.
   */
  if (!hasPermissions(session.user, [Permission.CREATE_EVENT])) {
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
    setCreationStatus(FormStatus.LOADING);

    /**
     * If the provideed data for the event being created is invalid, then
     * return an error message. This is so that empty events are not created.
     */
    if (!isValidEventData(event)) {
      return setCreationStatus(FormStatus.EMPTY_FIELDS); // setCreationStatus: void
    }

    /**
     * Create the event using the API.
     */
    const res = await createEvent({ accessToken: session.user.secret, event });

    /**
     * If the event was successfully created, then set the status to success.
     */
    if (res.success) {
      setCreationStatus(FormStatus.SUCCESS);

      /**
       * Redirect the user to the next-steps page.
       */
      router.push("/next-steps");
    } else {
      /**
       * If the event was not successfully created, then set the status to error.
       */
      setCreationStatus(FormStatus.ERROR);
    }
  }

  /**
   * Return the main components for the events page.
   */
  return (
    <MainWrapper className="p-10 pt-20 lg:p-20 lg:pt-44">
      <form
        className="flex w-full flex-col"
        onSubmit={async (e) => onSubmit(e, event, session)}
      >
        {/** HEADER */}
        <h1 className="mb-7 text-5xl font-thin uppercase text-white md:text-7xl">
          Create Event
        </h1>

        {/**
         * EVENT NAME
         *
         * The user can add a name to the event.
         * This will be displayed on the event page.
         */}
        <label className="mb-2 text-white">Event Name</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.event.max.name}
          minLength={config.event.min.name}
          placeholder="Name"
          type="text"
          onChange={(e) => setEvent({ ...event, name: e.target.value })}
        />

        {/**
         * EVENT DESCRIPTION
         *
         * The user can add a description to the event.
         * This will be displayed on the event page.
         */}
        <label className="mb-2 mt-5 text-white">Event Description</label>
        <textarea
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.event.max.description}
          minLength={config.event.min.description}
          placeholder="Description"
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
        />

        {/**
         * EVENT LOCATION
         *
         * The user can add a location to the event.
         * This will be displayed on the event page.
         * The location is not validated and is a string -- the user can input anything.
         */}
        <label className="mb-2 mt-5 text-white">Event Location</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.event.max.location}
          minLength={config.event.min.location}
          placeholder="Location"
          type="text"
          onChange={(e) => setEvent({ ...event, location: e.target.value })}
        />

        {/**
         * EVENT DATE
         *
         * The user can add a date to the event.
         * This will be displayed on the event page.
         * The date is not validated and is a string -- the user can input anything.
         */}
        <label className="mb-2 mt-5 text-white">Event Date</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.event.max.date}
          minLength={config.event.min.date}
          placeholder="Date"
          type="date"
          onChange={(e) => setEvent({ ...event, date: e.target.value })}
        />

        {/**
         * EVENT PERKS
         *
         * The user can add perks to the event.
         * These perks will be displayed on the event page.
         * The perks are seperated by commas.
         */}
        <label className="mb-2 mt-5 text-white">Event Perks</label>
        <input
          className="rounded-lg border border-primary bg-secondary px-4 py-3 text-base font-thin tracking-wider text-white duration-300 ease-in-out focus:outline-none"
          maxLength={config.event.max.perksInput}
          minLength={config.event.min.perks}
          placeholder="Perks (Seperate by comma)"
          type="text"
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
         * The user can add an image to the event.
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

        {/**
         * CREATE EVENT
         *
         * Once the user is finished creating the event, they can submit it.
         * This will send an http request to the API and create the event.
         * If the user hasn't filled in all the fields, then the event will not be created
         * and an error message will be displayed.
         */}
        <Button type="submit">Create Event</Button>

        {/**
         * If the user doesn't want to create the event, then they can cancel.
         *
         * This will just redirect them back to the events page.
         */}
        <LinkButton href="/">Cancel</LinkButton>
      </form>

      {/**
       * If the event was successfully created, then display a success message.
       *
       * This will appear before the user is redirected to the /next-steps page.
       */}
      {creationStatus === FormStatus.SUCCESS && (
        <SuccessMessage>
          <p>Event created successfully!</p>
        </SuccessMessage>
      )}

      {/**
       * If the event was not successfully created, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === FormStatus.ERROR && (
        <ErrorMessage>
          <p>There was an error creating your event.</p>
        </ErrorMessage>
      )}

      {/**
       * If the user hasn't filled in all the fields, then display an error message.
       *
       * The user will have the chance to input the data again.
       */}
      {creationStatus === FormStatus.EMPTY_FIELDS && (
        <ErrorMessage>
          <p>Make sure all fields are filled in.</p>
        </ErrorMessage>
      )}
    </MainWrapper>
  );
}

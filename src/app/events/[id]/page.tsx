"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type Event } from "@/types/event";
import {
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  CustomCursor,
  LinkButton,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";

/**
 * Status type
 */
enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function EventPage(): JSX.Element {
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
 * The main components for the event page. These are to be wrapped in a session provider
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  /**
   * Get the current session
   */
  const { status: sessionStatus } = useSession();

  /**
   * Manage event and status states
   */
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const { mutateAsync: getEvent } = trpc.getEvent.useMutation();

  /**
   * Pathname to get the id of the event
   */
  const path = usePathname();

  /**
   * Get the event id from the path
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to fetch the events again.
     */
    if (status !== Status.IDLE) {
      return;
    }

    /**
     * Set the fetch status to loading.
     */
    setStatus(Status.LOADING);

    /**
     * Get the event id from the path
     */
    const eventId = path.split("/").pop();

    /**
     * If the event id is undefined, display an error message.
     */
    if (!eventId) {
      return setStatus(Status.ERROR);
    }

    /**
     * Fetch the event from the database
     */
    getEvent({ id: eventId })
      .then((res) => {
        if (!res.event) {
          return setStatus(Status.ERROR);
        }

        setEvent(res.event);
        setStatus(Status.SUCCESS);
      })
      .catch(() => {
        setStatus(Status.ERROR);
      });
  }, []);

  /**
   * If the user is currently being authenticated, display a loading spinner.
   */
  if (sessionStatus === "loading" || status === Status.LOADING) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the event id is undefined, display an error message.
   */
  if (!event) {
    return (
      <MainWrapper>
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          Invalid Event ID
        </h1>

        <div className="flex flex-col gap-5">
          <p className="text-center text-sm font-light text-white lg:text-base">
            The event that you provided is invalid.
          </p>
          <LinkButton href="/">Go back</LinkButton>
        </div>
      </MainWrapper>
    );
  }

  /**
   * Return the main components.
   */
  return (
    <MainWrapper>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-primary p-10">
        <h1 className="text-6xl font-bold text-white">{event.name}</h1>
        <p className="text-sm font-thin text-white">{event.description}</p>
        <LinkButton href="/">Go back</LinkButton>
      </div>
    </MainWrapper>
  );
}

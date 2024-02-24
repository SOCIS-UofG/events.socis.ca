"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type Event } from "@/types/event";
import { trpc } from "@/lib/trpc/client";
import {
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  CustomCursor,
  LinkButton,
} from "socis-components";

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
  const { status: sessionStatus } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const { mutateAsync: getEventd, status } = trpc.getEvent.useMutation();

  const path = usePathname();

  /**
   * Get the event id from the path
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to fetch the events again.
     */
    if (status !== "idle") {
      return;
    }

    /**
     * Get the event id from the path
     */
    const eventId = path.split("/").pop();
    if (!eventId) {
      return;
    }

    /**
     * Fetch the event from the database
     */
    getEventd({ id: eventId }).then((res) => setEvent(res.event));
  }, []);

  /**
   * If the user is currently being authenticated, display a loading spinner.
   */
  if (sessionStatus === "loading" || status === "loading") {
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

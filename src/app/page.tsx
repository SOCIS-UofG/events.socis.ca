"use client";

import EventCard from "@/components/ui/EventCard";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { type Event } from "@/types/event";
import { trpc } from "@/lib/trpc/client";
import config from "@/lib/config/event.config";
import { Permission } from "@/types/global/permission";
import { hasPermissions } from "@/lib/utils/permissions";
import { Button, NextUIProvider, Spinner } from "@nextui-org/react";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import Background from "@/components/ui/global/Background";
import MainWrapper from "@/components/ui/global/MainWrapper";
import Link from "next/link";
import { type Status } from "@/types";

/**
 * Wraps the main components in a session provider for next auth.
 *
 * @returns JSX.Element
 */
export default function EventsPage() {
  return (
    <NextUIProvider>
      <Navbar />
      <CustomCursor />
      <Background text={"EVENTS"} animated={false} />

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
  const { data: session, status: sessionStatus } = useSession();

  const { mutateAsync: getEvents } = trpc.getAllEvents.useMutation();

  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  /**
   * We need to access the events from the database.
   */
  useEffect(() => {
    /**
     * If the fetch status is not idle, then we don't need to
     * fetch the events again.
     */
    if (status !== "idle") {
      return;
    }

    /**
     * Set the status to loading.
     */
    setStatus("loading");

    /**
     * Fetch the events from the database.
     */
    getEvents()
      .then((res) => {
        setEvents(res.events);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [session]);

  /**
   * If the fetch is still in progress, display a loading spinner.
   */
  if (sessionStatus === "loading" || status === "loading") {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * If the user is authenticated and can create events, then they can create an event.
   */
  const CAN_CREATE_EVENTS =
    session?.user && hasPermissions(session.user, [Permission.CREATE_EVENT]);

  /**
   * Filter the events to only include pinned events.
   *
   * This will be used to display the pinned events in their own
   * section.
   */
  const PINNED_EVENTS = events.filter((event) => event.pinned);

  /**
   * Filter the events to only include upcoming events.
   *
   * This will be used to display the upcoming events in their own
   * section.
   */
  const UPCOMING_EVENTS = events.filter((event) => {
    const eventDate = new Date(event.date);

    /**
     * If the event date is invalid, then return true.
     *
     * This is so that if no date was provided, the event will still show.
     */
    if (isNaN(eventDate.getTime())) {
      return true;
    }

    const currentDate = new Date();

    return eventDate > currentDate;
  });

  /**
   * Filter the events to only include past events.
   *
   * This will be used to display the past events in their own
   * section.
   */
  const PAST_EVENTS = events.filter((event) => {
    const eventDate = new Date(event.date);
    const currentDate = new Date();

    return eventDate < currentDate;
  });

  /**
   * Return the main components
   */
  return (
    <MainWrapper className="fade-in relative z-40 flex min-h-screen w-screen flex-col items-start justify-start gap-20 px-12 pb-20 pt-36 lg:px-20 lg:pt-40">
      {/**
       * PINNED EVENTS
       *
       * If there are pinned events, then display them in their own section.
       * If there are no pinned events, don't display the section or header. This
       * will prevent the page from looking empty.
       */}
      {PINNED_EVENTS.length > 0 && (
        <div className="flex flex-col items-start justify-start gap-7">
          <div className="flex flex-col items-start justify-start gap-3">
            <h1 className="text-left text-4xl font-extrabold uppercase text-white md:text-7xl lg:text-8xl">
              Pinned Events
            </h1>
            <p className="text-left text-sm font-thin text-white">
              Events that we are currently promoting.
            </p>
          </div>

          {/**
           * Render the pinned events.
           */}
          <div className="flex w-full flex-wrap items-start justify-start gap-10">
            {status === "success" &&
              PINNED_EVENTS.map((event) => (
                <EventCard key={event.id} user={session?.user} event={event} />
              ))}
          </div>
        </div>
      )}

      {/**
       * UPCOMING EVENTS
       *
       * Show all upcoming events (events whose dates are less than the current date).
       * At the end of the events list, render a button to create a new event. This will
       * appear even if there are no events so that users can suggest/create and event.
       */}
      <div className="flex w-full flex-col items-start justify-start gap-12">
        <div className="flex flex-col items-start justify-start gap-3">
          <h1 className="text-left text-4xl font-extrabold uppercase text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Upcoming Events
          </h1>

          <p className="text-left text-sm font-thin text-white">
            Events that are coming up soon. Get involved by making a suggestion!
          </p>

          <div className="flex w-full flex-wrap items-start justify-start gap-4">
            <Button
              className="btn"
              as={Link}
              color="primary"
              href={CAN_CREATE_EVENTS ? "/create" : config.event.suggestionUrl}
            >
              {CAN_CREATE_EVENTS ? "Create an event" : "Suggest an event"}
            </Button>

            <Button
              className="btn"
              as={Link}
              color="default"
              href={config.event.calendarUrl}
            >
              See Event Calendar
            </Button>
          </div>
        </div>

        {/**
         * Render the upcoming events.
         */}
        <div className="flex w-full flex-wrap items-start justify-start gap-7">
          {status === "success" &&
            UPCOMING_EVENTS.map((event) => (
              <EventCard key={event.id} user={session?.user} event={event} />
            ))}
        </div>
      </div>

      {/**
       * PAST EVENTS
       *
       * Show all past events (events whose dates are greater than the current date).
       * If there are no past events, don't display the section or header. This will
       * prevent the page from looking empty.
       */}
      {PAST_EVENTS.length > 0 && (
        <div className="flex flex-col items-start justify-start gap-7">
          <div className="flex flex-col items-start justify-start gap-3">
            <h1 className="text-left text-4xl font-extrabold uppercase text-white md:text-7xl lg:text-8xl">
              Past Events
            </h1>
            <p className="text-left text-sm font-thin text-white">
              Events that have already happened.
            </p>
          </div>

          {/**
           * Render the past events.
           */}
          <div className="flex w-full flex-wrap items-start justify-start gap-7">
            {status === "success" &&
              PAST_EVENTS.map((event) => (
                <EventCard key={event.id} user={session?.user} event={event} />
              ))}
          </div>
        </div>
      )}
    </MainWrapper>
  );
}

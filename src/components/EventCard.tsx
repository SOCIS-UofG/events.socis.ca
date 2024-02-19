import { cn } from "@/lib/utils/cn";
import { type Event } from "@/types/event";
import { type User } from "next-auth";
import EventDeleteButton from "./EventDeleteButton";
import EventEditButton from "./EventEditButton";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/permission";

/**
 * Props for the event card component.
 */
interface EventCardProps {
  // Custom class name (styling)
  className?: string;

  // The user object. This will be used to determine whether to display
  // the edit/delete buttons.
  user?: User;

  // The event info
  event: Event;
}

/**
 * The event card component.
 *
 * @param props The props for the component.
 * @returns JSX.Element
 */
export default function EventCard(props: EventCardProps): JSX.Element {
  const CAN_DELETE_EVENTS =
    props.user && hasPermissions(props.user, [Permission.DELETE_EVENT]);
  const CAN_EDIT_EVENTS =
    props.user && hasPermissions(props.user, [Permission.EDIT_EVENT]);

  /**
   * Return the main component.
   */
  return (
    <div
      className={cn(
        "btn relative flex h-fit w-96 flex-col items-start justify-start rounded-lg border border-primary bg-secondary p-6 duration-300 ease-in-out",
        props.className,
      )}
    >
      {/**
       * EVENT NAME
       *
       * The name of the event.
       */}
      <h1 className="text-3xl font-extrabold uppercase tracking-wider text-white">
        {props.event.name}
      </h1>

      {/**
       * EVENT DESCRIPTION
       *
       * The description of the event.
       */}
      <p className="mt-1 line-clamp-3 h-7 w-full overflow-hidden text-sm font-thin text-white">
        {/**
         * Show an ellipsis if the description is too long.
         */}
        {props.event.description}
      </p>

      {/**
       * EVENT DATE
       *
       * The date of the event.
       */}
      <p className="mt-2 text-xs font-thin text-white">{props.event.date}</p>

      {/**
       * EVENT LOCATION
       *
       * The location of the event.
       */}
      <p className="mt-1 text-xs font-thin text-white">
        {props.event.location}
      </p>

      {/**
       * EVENT PERKS
       *
       * The perks of the event.
       */}
      <div className="mt-3 flex flex-wrap gap-2">
        {props.event.perks.map((perk) => (
          <div className="w-fit rounded-md border border-primary bg-emerald-950/50 px-2 py-1 text-xs font-thin text-white">
            {perk}
          </div>
        ))}
      </div>

      {/**
       * Edit and Delete buttons for the event.
       */}
      {props.user && (
        <div className="mt-4 flex h-fit w-full flex-row gap-2">
          {CAN_EDIT_EVENTS && <EventEditButton event={props.event} />}
          {CAN_DELETE_EVENTS && (
            <EventDeleteButton user={props.user} event={props.event} />
          )}
        </div>
      )}
    </div>
  );
}

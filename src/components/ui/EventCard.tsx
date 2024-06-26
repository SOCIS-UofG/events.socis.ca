import { cn } from "@/lib/utils/cn";
import { type Event } from "@/types/event";
import { type User } from "next-auth";
import { hasPermissions } from "@/lib/utils/permissions";
import { Permission } from "@/types/global/permission";
import { trpc } from "@/lib/trpc/client";
import { type DetailedHTMLProps, type HTMLAttributes, useState } from "react";
import { type Status } from "@/types/global/status";
import Link from "next/link";
import Image from "next/image";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";

/**
 * The props for the event card component.
 *
 * Including also the custom props for the component.
 */
type EventCardProps = {
  // The user object. This will be used to determine whether to display
  // the edit/delete buttons.
  user?: User;

  // The event info
  event: Event;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

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

  const { mutateAsync: deleteEvent } = trpc.deleteEvent.useMutation();
  const { onOpen, onClose, isOpen, onOpenChange } = useDisclosure();
  const [status, setStatus] = useState<Status>("idle");

  /**
   * Return the main component.
   */
  return (
    <>
      <div
        {...props}
        className={cn(
          "btn relative flex h-80 min-h-fit w-full flex-col items-start justify-start rounded-xl border-2 border-neutral-700/60 bg-secondary p-6 duration-300 ease-in-out sm:max-w-64 md:max-w-72",
          props.className,
        )}
      >
        {/**
         * EVENT IMAGE
         *
         * The image of the event.
         */}
        <Image
          src={props.event.image}
          alt={props.event.name}
          width={400}
          height={200}
          className="absolute left-0 top-0 z-0 h-full w-full rounded-xl object-cover brightness-[0.25]"
        />

        <div className="z-10 flex h-full w-full flex-col items-start justify-start gap-1">
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
           * The description of the event
           */}
          <p className="line-clamp-3 h-32 w-full overflow-hidden text-sm font-thin text-white">
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
          <p className="mt-2 text-xs font-thin text-white">
            {props.event.date}
          </p>

          {/**
           * EVENT LOCATION
           *
           * The location of the event.
           */}
          <p className="text-xs font-thin text-white">{props.event.location}</p>

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
            <div className="mt-2 flex h-fit w-full flex-wrap gap-2">
              {CAN_EDIT_EVENTS && (
                <Button
                  as={Link}
                  color="default"
                  size="sm"
                  variant="bordered"
                  className="btn"
                  href={`/edit/${props.event.id}`}
                >
                  Edit
                </Button>
              )}

              {CAN_DELETE_EVENTS && (
                <Button
                  color="danger"
                  size="sm"
                  variant="bordered"
                  className="btn"
                  onClick={onOpen}
                  disabled={status === "loading"}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/**
       * DELETE EVENT MODAL
       *
       * The modal for deleting the event.
       */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete the event{" "}
              <strong>{props.event.name}</strong>? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="btn"
              disabled={status === "loading"}
              color="danger"
              onClick={async () => {
                if (!props.user) {
                  return;
                }

                setStatus("loading");

                await deleteEvent({
                  id: props.event.id,
                  accessToken: props.user.secret,
                })
                  .then(() => {
                    setStatus("success");
                  })
                  .catch(() => {
                    setStatus("error");
                  });

                onClose();
              }}
            >
              {status === "loading" ? (
                <Spinner size="sm" color="white" />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              className="btn"
              color="default"
              onClick={onClose}
              disabled={status === "loading"}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

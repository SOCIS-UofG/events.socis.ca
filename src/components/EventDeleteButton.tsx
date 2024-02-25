import { trpc } from "@/lib/trpc/client";
import { type Event } from "@/types/event";
import { type User } from "next-auth";
import { useState } from "react";
import { LoadingSpinner } from "socis-components";

/**
 * Props for the delete button.
 */
interface Props {
  user: User;
  event: Event;
}

/**
 * Status for the delete button.
 */
enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

/**
 * Delete button for events.
 *
 * @param props The props for the delete button
 * @returns JSX.Element
 */
export default function DeleteButton(props: Props): JSX.Element {
  const { user, event } = props;
  const { mutateAsync: deleteEvent } = trpc.deleteEvent.useMutation();
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<Status>(Status.IDLE);

  /**
   * Delete the event.
   *
   * @param user The user who's trying to delete the event
   * @returns void
   */
  async function onDeleteEvent(user: User): Promise<void> {
    const res = await deleteEvent({ id: event.id, accessToken: user.secret });

    setStatus(res.success ? Status.ERROR : Status.SUCCESS);
  }

  /**
   * If the user has not confirmed the deletion, show the delete button.
   *
   * When this button is clicked, the confirm state is set to true.
   * This causes the cancel/confirm buttons to be shown.
   */
  if (!confirm) {
    return (
      <button
        className="flex h-10 flex-col items-center justify-center rounded-lg border border-primary px-7 text-center text-sm font-thin text-white hover:bg-emerald-900/50"
        onClick={() => setConfirm(true)}
      >
        Delete
      </button>
    );
  }

  /**
   * If the user has confirmed the deletion, show the cancel/confirm buttons.
   *
   * When the cancel button is clicked, the confirm state is set to false.
   * This causes the delete button to be shown.
   *
   * When the confirm button is clicked, the deleteEvent function is called.
   * This send a request to the API to delete the event.
   */
  return (
    <div className="flex h-full w-full flex-row gap-2">
      {/**
       * Confirm button
       *
       * When this button is clicked, the deleteEvent function is called.
       */}
      <button
        className="flex h-10 min-h-[2.5rem] w-10 flex-col items-center justify-center rounded-lg border border-primary px-4 text-center text-sm font-thin text-white hover:bg-emerald-900/50 disabled:opacity-50"
        disabled={status === Status.LOADING}
        onClick={async () => await onDeleteEvent(user)}
      >
        {status === Status.LOADING ? (
          <LoadingSpinner className="h-5 w-5" />
        ) : (
          "Confirm"
        )}
      </button>

      {/**
       * Cancel button
       *
       * When this button is clicked, the confirm state is set to false.
       */}
      <button
        disabled={status === Status.LOADING}
        className="flex h-10 min-h-[2.5] w-10 flex-col items-center justify-center rounded-lg border border-primary px-4 text-center text-sm font-thin text-white hover:bg-emerald-900/50 disabled:opacity-50"
        onClick={() => setConfirm(false)}
      >
        Cancel
      </button>
    </div>
  );
}

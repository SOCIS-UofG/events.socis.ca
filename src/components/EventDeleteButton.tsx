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
 * Status of the deletion.
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

  /**
   * States to keep track of the status of the deletion.
   */
  const [status, setStatus] = useState(Status.IDLE);
  const [confirm, setConfirm] = useState(false);

  /**
   * Delete the event.
   *
   * @param user The user who's trying to delete the event
   * @returns void
   */
  async function deleteEvent(user: User): Promise<void> {
    setStatus(Status.LOADING);

    /**
     * Send an http request to the api to delete the event.
     */
    const res = await deleteEventApi(user, event.id);

    /**
     * If the event was successfully deleted, reload the page.
     */
    if (res.ok) {
      setStatus(Status.SUCCESS);

      return window.location.reload();
    }

    /**
     * If the event was not successfully deleted, show an error message.
     */
    setStatus(Status.ERROR);
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
        onClick={async () => await deleteEvent(user)}
      >
        {status === Status.LOADING ? (
          <LoadingSpinner className="h-5 w-5" />
        ) : (
          <CheckmarkSvg />
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
        <XSvg />
      </button>
    </div>
  );
}

/**
 * Checkmark SVG
 *
 * @returns JSX.Element
 */
function CheckmarkSvg(): JSX.Element {
  return (
    <svg
      fill="#ffffff"
      height="15px"
      width="15px"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 17.837 17.837"
    >
      <g>
        <path
          d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27
		c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0
		L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"
        />
      </g>
    </svg>
  );
}

/**
 * X SVG
 *
 * @returns JSX.Element
 */
function XSvg(): JSX.Element {
  return (
    <svg
      fill="#ffffff"
      height="15px"
      width="15px"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460.775 460.775"
    >
      <path
        d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
	c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
	c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
	c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
	l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
	c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
      />
    </svg>
  );
}

/**
 * Delete an event.
 *
 * @param user The user who's trying to delete the event
 * @param id The id of the event to delete
 * @returns void
 */
async function deleteEventApi(user: User, eventId: string) {
  return await fetch("/api/events", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: user.secret,
    },
    body: JSON.stringify({ eventId }),
  });
}

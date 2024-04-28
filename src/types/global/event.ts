/**
 * Event type
 */
export interface Event {
  /**
   * The event's ID
   *
   * This is a unique identifier for the event.
   */
  id: string;
  /**
   * The event's creation date
   *
   * This is the date the event was created.
   */
  createdAt?: string;
  /**
   * The event's last update date
   *
   * This is the date the event was last updated.
   */
  updatedAt?: string;
  /**
   * The event's name
   *
   * This is the name of the event.
   */
  name: string;
  /**
   * The event's description
   *
   * This is the description of the event.
   */
  description: string;
  /**
   * The event's date
   *
   * This is the date of the event.
   */
  date: string;
  /**
   * The event's location
   *
   * This is the location of the event.
   */
  location: string;
  /**
   * The event's image
   *
   * This is the image of the event.
   */
  image: string;
  /**
   * The event's perks
   *
   * These are the perks of the event.
   */
  perks: string[];
  /**
   * The event's RSVPs
   *
   * These are the RSVPs of the event.
   */
  rsvps: string[];
  /**
   * The event's pinned status
   *
   * This is the pinned status of the event.
   */
  pinned: boolean;
}

import { type Event } from "@/types/event";
import config from "@/lib/config/event.config";

/**
 * Check if an event is valid
 * @param event The event to check
 * @returns Whether or not the event is valid
 */
export function isValidEventData(event: Event): boolean {
  /**
   * Check if the event object is invalid
   *
   * For this to be invalid, the event must be:
   * - undefined
   */
  if (!event) {
    return false;
  }

  /**
   * Check if the event's name is invalid
   *
   * For this to be invalid, the event's name must be:
   * - empty string
   * - undefined
   * - longer than the max event name length
   * - shorter than the min event name length
   */
  if (
    !event.name ||
    event.name.length > config.event.max.name ||
    event.name.length < config.event.min.name
  ) {
    return false;
  }

  /**
   * Check if the event's description is invalid
   *
   * For this to be invalid, the event's description must be:
   * - empty string
   * - undefined
   * - longer than the max event description length
   * - shorter than the min event description length
   */
  if (
    !event.description ||
    event.description.length > config.event.max.description ||
    event.description.length < config.event.min.description
  ) {
    return false;
  }

  /**
   * Check if the event's date is invalid
   *
   * For this to be invalid, the event's date must be:
   * - empty string
   * - undefined
   * - longer than the max event date length
   * - shorter than the min event date length
   */
  if (
    !event.date ||
    event.date.length > config.event.max.date ||
    event.date.length < config.event.min.date
  ) {
    return false;
  }

  /**
   * Check if the event's location is invalid
   *
   * For this to be invalid, the event's location must be:
   * - empty string
   * - undefined
   * - longer than the max event location length
   * - shorter than the min event location length
   */
  if (
    !event.location ||
    event.location.length > config.event.max.location ||
    event.location.length < config.event.min.location
  ) {
    return false;
  }

  /**
   * Check if the event's perks is invalid
   *
   * For this to be invalid, the event's perks must be:
   * - undefined
   * - longer than the max event perks length
   * - shorter than the min event perks length
   */
  if (
    !event.perks ||
    event.perks.length > config.event.max.perks ||
    event.perks.length < config.event.min.perks
  ) {
    return false;
  }

  /**
   * Return true if the event is valid
   */
  return true;
}

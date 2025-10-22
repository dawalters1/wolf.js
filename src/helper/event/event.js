import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Event from '../../entities/event.js';
import EventChannelHelper from './eventChannel.js';
import EventSubscriptionHelper from './eventSubscription.js';
import { validate } from '../../validator/index.js';

class EventHelper extends BaseHelper {
  #channel;
  #subscription;
  constructor (client) {
    super(client);

    this.#channel = new EventChannelHelper(client);
    this.#subscription = new EventSubscriptionHelper(client);
  }

  get channel () {
    return this.#channel;
  }

  get subscription () {
    return this.#subscription;
  }

  async getById (eventId, opts) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(eventId)
        .isNotNullOrUndefined(`EventHelper.getById() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventHelper.getById() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThan(0, `EventHelper.getById() parameter, eventId: ${eventId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'EventHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([eventId], opts))[0];
  }

  async getByIds (eventIds, opts) {
    eventIds = eventIds.map((eventId) => Number(eventId) || eventId);

    { // eslint-disable-line no-lone-blocks
      validate(eventIds)
        .isArray(`EventHelper.getByIds() parameter, eventIds: ${eventIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('EventHelper.getByIds() parameter, eventId[{index}]: {value} is null or undefined')
        .isValidNumber('EventHelper.getByIds() parameter, eventId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'EventHelper.getByIds() parameter, eventId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'EventHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? eventIds
      : eventIds.filter((eventId) => !this.store.has((event) => event.id === eventId));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.GROUP_EVENT,
        {
          body: {
            idList: idsToFetch,
            subscribe: opts?.subscribe ?? true
          }
        }
      );

      for (const [index, eventResponse] of response.body.entries()) {
        const eventId = idsToFetch[index];

        if (!eventResponse.success) {
          this.store.delete((event) => event.id === eventId);
          continue;
        }
        this.store.set(
          new Event(this.client, eventResponse.body),
          response.headers?.maxAge
        );
      }
    }
    return eventIds.map((eventId) =>
      this.store.get((event) => event.id === eventId)
    );
  }
}

export default EventHelper;

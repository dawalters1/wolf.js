import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Event from '../../entities/event.js';
import EventChannelHelper from './eventChannel.js';
import EventSubscriptionHelper from './eventSubscription.js';
import { validate } from '../../validator/index.js';

class EventHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.channel = new EventChannelHelper(client);
    this.subscription = new EventSubscriptionHelper(client);
  }

  async getById (eventId, opts) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(eventId)
        .isNotNullOrUndefined(`EventHelper.getById() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventHelper.getById() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThanZero(`EventHelper.getById() parameter, eventId: ${eventId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }

    return (await this.getByIds([eventId], opts))[0];
  }

  async getByIds (eventIds, opts) {
    const eventsMap = new Map();

    if (!opts?.forceNew) {
      const cachedEvents = this.cache.getAll(eventIds).filter(event => event !== null);
      cachedEvents.forEach(event => eventsMap.set(event.id, event));
    }

    const idsToFetch = eventIds.filter(id => !eventsMap.has(id));

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

      [...response.body.values()]
        .filter(eventResponse => eventResponse.success)
        .forEach(eventResponse => {
          const existing = this.cache.get(eventResponse.body.id);

          eventsMap.set(
            eventResponse.body.id,
            this.cache.set(
              existing
                ? existing.patch(eventResponse.body)
                : new Event(this.client, eventResponse.body)
            )
          );
        });
    }

    return eventIds.map(eventId => eventsMap.get(eventId) ?? null);
  }
}

export default EventHelper;

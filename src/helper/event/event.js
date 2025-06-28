import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Event from '../../entities/event.js';
import EventChannelHelper from './eventChannel.js';
import EventSubscriptionHelper from './eventSubscription.js';

class EventHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.channel = new EventChannelHelper(client);
    this.subscription = new EventSubscriptionHelper(client);
  }

  async getById (eventId, opts) {
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

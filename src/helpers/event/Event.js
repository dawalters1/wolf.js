import BaseHelper from '../BaseHelper.js';
import Event from '../../entities/Event.js';
import EventChannelHelper from './EventChannel.js';
import EventSubscriptionHelper from './EventSubscription.js';

export default class EventHelper extends BaseHelper {
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

  async fetch (eventIds, opts) {
    const isArrayResponse = Array.isArray(eventIds);
    const normalisedEventIds = this.normaliseNumbers(eventIds);

    const idsToFetch = opts?.forceNew
      ? normalisedEventIds
      : normalisedEventIds.filter((eventId) => !this.store.has((item) => item.id === eventId));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'group event',
        {
          headers: {
            version: 1
          },
          body: {
            idList: idsToFetch,
            subscribe: opts?.subscribe ?? true
          }
        }
      );

      const maxAge = response.headers.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const id = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.store.set(
          new Event(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const events = normalisedEventIds.map((eventId) => this.store.get((item) => item.id === eventId));

    return isArrayResponse
      ? events
      : events[0];
  }
}

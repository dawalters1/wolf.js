import BaseHelper from '../BaseHelper.js';
import EventSubscription from '../../entities/EventSubscription.js';

export default class EventSubscriptionHelper extends BaseHelper {
  async fetch (opts) {
    if (!opts?.forceNew && this.store.fetched) { return this.store.values(); }

    const response = await this.client.websocket.emit(
      'subscriber group event list',
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.store.clear();
    this.store.fetched = true;

    const maxAge = response.headers?.maxAge;

    return response.body.map((serverEventSubscription) =>
      this.store.set(
        new EventSubscription(this.client, serverEventSubscription),
        maxAge
      )
    );
  }

  async add (eventId) {
    const normalisedEventId = this.normaliseNumber(eventId);

    const event = await this.client.event.fetch(normalisedEventId);

    if (event === null) { throw new Error(`Event with ID ${normalisedEventId} NOT FOUND`); }

    return await this.client.websocket.emit(
      'subscriber group event add',
      {
        body: {
          id: normalisedEventId
        }
      }
    );
  }

  async remove (eventId) {
    const normalisedEventId = this.normaliseNumber(eventId);

    const event = await this.client.event.fetch(normalisedEventId);

    if (event === null) { throw new Error(`Event with ID ${normalisedEventId} NOT FOUND`); }

    return await this.client.websocket.emit(
      'subscriber group event delete',
      {
        body: {
          id: normalisedEventId
        }
      }
    );
  }
}

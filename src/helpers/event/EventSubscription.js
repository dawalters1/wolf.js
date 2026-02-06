import BaseHelper from '../BaseHelper.js';
import EventSubscription from '../../entities/EventSubscription.js';
import { validate } from '../../validation/Validation.js';

export default class EventSubscriptionHelper extends BaseHelper {
  async fetch (opts) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),

          subscribe: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

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
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    const normalisedEventId = this.normaliseNumber(eventId);

    validate(normalisedEventId, this, this.add)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    const normalisedEventId = this.normaliseNumber(eventId);

    validate(normalisedEventId, this, this.remove)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

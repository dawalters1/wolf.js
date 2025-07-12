import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import EventSubscription from '../../entities/eventSubscription.js';
import { validate } from '../../validator/index.js';

class EventSubscriptionHelper extends BaseHelper {
  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'EventSubscriptionHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    const cachedSubscriptionIds = this.cache.keys();
    const newSubscriptionIds = response.body.map((serverEventSubscription) => serverEventSubscription.id);
    const oldSubscriptionIds = cachedSubscriptionIds.filter((subscriptionId) => !newSubscriptionIds.includes(subscriptionId));
    this.cache.deleteAll(oldSubscriptionIds);
    this.cache.fetched = true;

    return response.body.map((serverEventSubscription) => {
      const existing = this.cache.get(serverEventSubscription.id);

      return this.cache.set(
        existing
          ? existing.patch(serverEventSubscription)
          : new EventSubscription(this.client, serverEventSubscription)
      );
    });
  }

  async add (eventId) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(eventId)
        .isNotNullOrUndefined(`EventSubscriptionHelper.add() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventSubscriptionHelper.add() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThanZero(`EventSubscriptionHelper.add() parameter, eventId: ${eventId} is less than or equal to zero`);
    }

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(`Event with ID ${eventId} not found`); }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_ADD,
      {
        body: {
          id: eventId
        }
      }
    );
  }

  async remove (eventId) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(eventId)
        .isNotNullOrUndefined(`EventSubscriptionHelper.remove() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventSubscriptionHelper.remove() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThanZero(`EventSubscriptionHelper.remove() parameter, eventId: ${eventId} is less than or equal to zero`);
    }

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(`Event with ID ${eventId} not found`); }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_DELETE,
      {
        body: {
          id: eventId
        }
      }
    );
  }
}

export default EventSubscriptionHelper;

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
    if (!opts?.forceNew && this.store.fetched) {
      return this.store.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    const cachedSubscriptionIds = this.store.keys();
    const newSubscriptionIds = response.body.map((serverEventSubscription) => serverEventSubscription.id);
    const oldSubscriptionIds = cachedSubscriptionIds.filter((subscriptionId) => !newSubscriptionIds.includes(subscriptionId));
    oldSubscriptionIds.forEach((subscriptionId) => this.store.delete(subscriptionId));

    this.store._fetched = true;

    return response.body.map((serverEventSubscription) => {
      const existing = this.store.get(serverEventSubscription.id);

      return this.store.set(
        existing?.patch(serverEventSubscription) ?? new EventSubscription(this.client, serverEventSubscription),
        response.headers?.maxAge
      );
    });
  }

  async add (eventId) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(eventId)
        .isNotNullOrUndefined(`EventSubscriptionHelper.add() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventSubscriptionHelper.add() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThan(0, `EventSubscriptionHelper.add() parameter, eventId: ${eventId} is less than or equal to zero`);
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
        .isGreaterThan(0, `EventSubscriptionHelper.remove() parameter, eventId: ${eventId} is less than or equal to zero`);
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

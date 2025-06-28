import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import EventSubscription from '../../entities/eventSubscription.js';

class EventSubscriptionHelper extends BaseHelper {
  async list (opts) {
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

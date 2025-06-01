import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import EventSubscription from '../../structures/eventSubscription.ts';
import { EventSubscriptionOptions } from '../../options/requestOptions.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class EventSubscriptionHelper extends BaseHelper<EventSubscription> {
  async list (opts: EventSubscriptionOptions): Promise<EventSubscription[]> {
    if (!opts?.forceNew && this.cache.fetched) { return this.cache.values(); }

    const response = await this.client.websocket.emit<EventSubscription[]>(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.cache.fetched = true;
    this.cache.clear();

    return this.cache.setAll(response.body);
  }

  async add (eventId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_ADD,
      {
        body: {
          id: eventId
        }
      }
    );
  }

  async remove (eventId: number): Promise<WOLFResponse> {
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

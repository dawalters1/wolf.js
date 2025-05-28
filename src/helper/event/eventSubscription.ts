/* eslint-disable @typescript-eslint/no-non-null-assertion */
import WOLF from '../../client/WOLF.ts';
import { Command } from '../../constants/Command.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { EventSubscriptionOptions } from '../../options/requestOptions.ts';
import EventSubscription from '../../structures/eventSubscription.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

class EventSubscriptionHelper extends Base<CacheManager<EventSubscription, Map<number, EventSubscription>>> {
  constructor (client: WOLF) {
    super(client, new CacheManager(new Map()));
  }

  async list (opts: EventSubscriptionOptions): Promise<EventSubscription[]> {
    if (!opts?.forceNew && this.cache!.fetched) { return this.cache!.values(); }

    const response = await this.client.websocket.emit<EventSubscription[]>(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.cache!.clear();

    return this.cache!.mset(response.body);
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

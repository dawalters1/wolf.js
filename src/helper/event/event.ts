/* eslint-disable @typescript-eslint/no-non-null-assertion */

import CacheManager from '../../managers/cacheManager.ts';
import Base from '../base.ts';
import Event from '../../structures/event.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import { Command } from '../../constants/Command.ts';
import EventChannelHelper from './eventChannel.ts';
import { EventOptions } from '../../options/requestOptions.ts';

class EventHelper extends Base<CacheManager<Event, Map<number, Event>>> {
  channel: EventChannelHelper;

  constructor (client: WOLF) {
    super(client, new CacheManager(new Map()));
    this.channel = new EventChannelHelper(client);
  }

  async getById (eventId: number, opts?:EventOptions): Promise<Event | null> {
    return (await this.getByIds([eventId], opts))[0];
  }

  async getByIds (eventIds: number[], opts?:EventOptions): Promise<(Event | null)[]> {
    const eventsMap = new Map<number, Event>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedEvents = this.cache!.mget(eventIds)
        .filter((event): event is Event => event !== null);

      cachedEvents.forEach((event) => eventsMap.set(event.id, event));
    }

    const missingIds = eventIds.filter((id) => !eventsMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<WOLFResponse<Event>[]>(
        Command.GROUP_EVENT,
        {
          body: {
            idList: missingIds,
            subscribe: opts?.subscribe ?? true
          }
        });

      response.body.filter((eventResponse) => eventResponse.success)
        .forEach((eventResponse) => eventsMap.set(eventResponse.body.id, this.cache!.set(eventResponse.body)));
    }

    return eventIds.map((eventId) => eventsMap.get(eventId) ?? null);
  }
}

export default EventHelper;

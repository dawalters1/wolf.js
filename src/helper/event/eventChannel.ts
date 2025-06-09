
import BaseHelper from '../baseHelper.ts';
import ChannelEvent, { ServerGroupEvent } from '../../structures/channelEvent.ts';
import { Command } from '../../constants/Command.ts';
import CreateChannelEvent from '../../structures/createChannelEvent.ts';
import Event, { ServerEvent } from '../../structures/event.ts';
import { EventChannelOptions } from '../../options/requestOptions.ts';
import UpdateChannelEvent from '../../structures/updateChannelEvent.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

const eventHasData = (event: UpdateChannelEvent) => event.category || event.endsAt || event.hostedBy || event.longDescription || event.shortDescription || event.startsAt || event.title;

class EventChannelHelper extends BaseHelper<ChannelEvent> {
  async list (channelId: number, opts?: EventChannelOptions): Promise<ChannelEvent[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    if (!opts?.forceNew && channel.events.fetched) { return channel.events.values(); }

    const get = async (results: ServerGroupEvent[] = []): Promise<ServerGroupEvent[]> => {
      const response = await this.client.websocket.emit<ServerGroupEvent[]>(
        Command.GROUP_EVENT_LIST,
        {
          body: {
            id: channelId,
            subscribe: opts?.subscribe ?? true,
            limit: 50,
            offset: results.length
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await get(results);
    };

    channel.events.fetched = true;

    return (await get()).map((ServerGroupEvent) => {
      const existing = channel.events.get(ServerGroupEvent.id);

      return channel.events.set(
        existing
          ? existing.patch(ServerGroupEvent)
          : new ChannelEvent(this.client, ServerGroupEvent)
      );
    });
  }

  async create (channelId: number, eventData: CreateChannelEvent) {
    // validation

    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    // Check privileges for create

    const responses = [] as (Event | WOLFResponse)[];

    const { thumbnail, ...patchable } = eventData;

    const response = await this.client.websocket.emit<ServerEvent>(
      Command.GROUP_EVENT_CREATE,
      {
        body: {
          groupId: channelId,
          ...patchable // TODO: do this properly
        }
      }
    );

    responses.push(new Event(this.client, response.body));

    if (eventData.thumbnail) {
      responses.push(await this.client.multimedia.post('', ''));
    }

    return responses;
  }

  async update (channelId: number, eventId: number, eventData: UpdateChannelEvent): Promise<(WOLFResponse | WOLFResponse<Event>)[]> {
    // validation
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(''); }

    // Check privileges for update

    const responses = [] as (WOLFResponse | WOLFResponse<Event>)[];

    if (eventData.thumbnail) {
      responses.push(await this.client.multimedia.post('', ''));
    }

    if (eventHasData(eventData)) {
      const { thumbnail, ...patchable } = eventData;

      responses.push(
        await this.client.websocket.emit<Event>(
          Command.GROUP_EVENT_UPDATE,
          {
            body: {
              groupId: channelId,
              id: eventId,
              ...patchable // TODO: do this properly
            }
          }
        )
      );
    }

    return responses;
  }

  async delete (channelId: number, eventId: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        body: {
          groupId: channelId,
          id: eventId,
          isRemoved: true
        }
      }
    );
  }
}

export default EventChannelHelper;

import BaseHelper from '../baseHelper.js';
import ChannelEvent from '../../entities/channelEvent.js';
import { Command } from '../../constants/Command.js';
import Event from '../../entities/event.js';

const eventHasData = (event) =>
  event.category ||
  event.endsAt ||
  event.hostedBy ||
  event.longDescription ||
  event.shortDescription ||
  event.startsAt ||
  event.title;

class EventChannelHelper extends BaseHelper {
  async list (channelId, opts) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!opts?.forceNew && channel._events.fetched) {
      return channel._events.values();
    }

    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
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

    channel._events.fetched = true;

    return (await get()).map((serverGroupEvent) => {
      const existing = channel._events.get(serverGroupEvent.id);

      return channel._events.set(
        existing
          ? existing.patch(serverGroupEvent)
          : new ChannelEvent(this.client, serverGroupEvent)
      );
    });
  }

  async create (channelId, eventData) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const responses = [];

    const { thumbnail, ...patchable } = eventData;

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        body: {
          groupId: channelId,
          ...patchable // TODO: do this properly
        }
      }
    );

    responses.push(new Event(this.client, response.body));

    if (thumbnail) {
      responses.push(await this.client.multimedia.post('', ''));
    }

    return responses;
  }

  async update (channelId, eventId, eventData) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const event = await this.client.event.getById(eventId);

    if (event === null) {
      throw new Error('');
    }

    const responses = [];

    if (eventData.thumbnail) {
      responses.push(await this.client.multimedia.post('', ''));
    }

    if (eventHasData(eventData)) {
      const { thumbnail, ...patchable } = eventData;

      responses.push(
        await this.client.websocket.emit(
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

  async delete (channelId, eventId) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const event = await this.client.event.getById(eventId);

    if (event === null) {
      throw new Error('');
    }

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

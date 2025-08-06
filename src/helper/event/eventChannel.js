import BaseHelper from '../baseHelper.js';
import ChannelEvent from '../../entities/channelEvent.js';
import { Command } from '../../constants/Command.js';
import Event from '../../entities/event.js';
import { validate } from '../../validator/index.js';

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
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`EventChannelHelper.list() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.list() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.list() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'EventChannelHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
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
        existing?.patch(serverGroupEvent) ?? new ChannelEvent(this.client, serverGroupEvent));
    });
  }

  async create (channelId, eventData) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`EventChannelHelper.create() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.create() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.create() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(eventData)
        .isValidObject();
    }
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
    channelId = Number(channelId) || channelId;
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`EventChannelHelper.list() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.list() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.list() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(eventId)
        .isNotNullOrUndefined(`EventChannelHelper.update() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.update() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.update() parameter, eventId: ${eventId} is less than or equal to zero`);

      validate(eventData)
        .isValidObject();
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(`Event with ID ${eventId} not found`); }

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
    channelId = Number(channelId) || channelId;
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`EventChannelHelper.delete() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.delete() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.delete() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(eventId)
        .isNotNullOrUndefined(`EventChannelHelper.delete() parameter, eventId: ${eventId} is null or undefined`)
        .isValidNumber(`EventChannelHelper.delete() parameter, eventId: ${eventId} is not a valid number`)
        .isGreaterThan(0, `EventChannelHelper.delete() parameter, eventId: ${eventId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const event = await this.client.event.getById(eventId);

    if (event === null) { throw new Error(`Event with ID ${eventId} not found`); }

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

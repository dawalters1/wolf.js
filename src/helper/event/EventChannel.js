'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import EventChannelCache from '../../cache/EventChannelCache.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

// TODO: update to new caching approach
class EventChannel extends Base {
  constructor (client) {
    super(client);

    this.eventChannelCache = new EventChannelCache();
  }

  async get (channelId, forceNew = false) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`EventChannel.get() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`EventChannel.get() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`EventChannel.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const events = forceNew
      ? []
      : this.eventChannelCache.get(channelId)
        .fiter(Boolean);

    if (events.length) { return events; }

    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
        Command.GROUP_EVENT_LIST,
        {
          offset: results.length,
          limit: 50
        }
      );

      results.push(...response.body.map((channelEvent) => new structures.EventChannel(this.client, channelEvent)));

      if (response.body.length < 50) {
        return results;
      }

      return await get(results);
    };

    return this.eventChannelCache.set(channelId, await get());
  }

  async create (eventBuilder) {

  }

  async update () {

  }

  async delete (channelId, eventId) {
    channelId = Number(channelId) || channelId;
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks

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

export default EventChannel;

'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import ChannelCache from '../../cache/ChannelCache.js';
import structures from '../../structures/index.js';
// Variables
import { ChannelEntities, Command, Language } from '../../constants/index.js';

class Channel extends Base {
  constructor (client) {
    super(client);

    this.cache = new ChannelCache();
    this.cache.fetched = false;
  }

  async list (forceNew = false) {
    { // eslint-disable-line no-lone-blocks

    }
  }

  async getById (id, subscribe = true, entities = Object.values(ChannelEntities), forceNew = false) {
    id = Number(id) || id;

    { // eslint-disable-line no-lone-blocks

    }

    return (await this.getByIds([id], entities, subscribe, forceNew))[0];
  }

  async getByIds (ids, subscribe = true, entities = Object.values(ChannelEntities), forceNew = false) {
    ids = ids.map((id) => Number(id) || id);

    { // eslint-disable-line no-lone-blocks

    }

    const channels = this.cache.get(ids)
      .filter(Boolean);

    if (channels.length === ids.length) { return channels; }

    const idList = ids.filter((id) => !channels.some((channel) => channel.id === id));

    const response = await this.client.websocket.emit(
      Command.GROUP_PROFILE,
      {
        headers: { version: 4 },
        body: {
          idList,
          subscribe,
          entities
        }
      }
    );

    response.body.forEach((subResponse, index) =>
      channels.push(subResponse.success
        ? this.cache.set(new structures.Channel(this.client, subResponse.body))
        : new structures.Channel(this.client, { id: idList[index] })
      )
    );

    // Sort to match ids order
    return ids
      .map((id) =>
        channels.find((channel) => channel.id === id)
      );
  }

  async getByName (name, subscribe = true, entities = Object.values(ChannelEntities), forceNew = false) {
    { // eslint-disable-line no-lone-blocks

    }

    if (!forceNew) {
      const channel = this.cache.list().find((channel) => channel.name === name) ?? null;

      if (channel) {
        return channel;
      }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.GROUP_PROFILE,
        {
          headers: { version: 4 },
          body: {
            name,
            subscribe,
            entities
          }
        }
      );

      return this.cache.set(new structures.Channel(this.client, response.body));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return new structures.Channel(this.client, { name });
      }

      throw error;
    }
  }
}

export default Channel;

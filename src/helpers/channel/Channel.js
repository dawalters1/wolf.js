import BaseHelper from '../BaseHelper.js';
import Channel from '../../entities/Channel.js';
import ChannelCategorHelper from './ChannelCategory.js';
import ChannelEntities from '../../constants/ChannelEntities.js';
import ChannelMemberHelper from './ChannelMember.js';
import ChannelRoleHelper from './ChannelRole.js';
import Message from '../../entities/Message.js';
import Search from '../../entities/Search.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validation/Validation.js';

export default class ChannelHelper extends BaseHelper {
  #category;
  #member;
  #roles;

  constructor (client) {
    super(client);

    this.#category = new ChannelCategorHelper(client);
    this.#member = new ChannelMemberHelper(client);
    this.#roles = new ChannelRoleHelper(client);
  }

  get category () {
    return this.#category;
  }

  get member () {
    return this.#member;
  }

  get roles () {
    return this.#roles;
  }

  async fetch (idsOrName, opts) {
    const normalisedChannelIdOrName = this.normaliseNumber(idsOrName);

    if (!normalisedChannelIdOrName || this.isObject(normalisedChannelIdOrName)) {
      opts = normalisedChannelIdOrName;

      validate(opts, this, this.fetch)
        .isNotRequired()
        .forEachProperty(
          {
            forceNew: validator => validator
              .isNotRequired()
              .isBoolean(),
            subscribe: validator => validator
              .isNotRequired()
              .isBoolean(),
            entities: validator => validator
              .isNotRequired()
              .isArray()
              .each()
              .in(Object.values(ChannelEntities))
          }
        );

      if (!opts?.forceNew && this.store.fetched) {
        return this.store.filter((item) => item.isMember);
      }

      const response = await this.client.websocket.emit(
        'subscriber group list',
        {
          body: {
            subscribe: opts?.subscribe ?? true
          }
        }
      );

      this.store.clear();
      this.store.fetched = true;

      if (response.body.length > 0) {
        const channelIdList = response.body.map((serverChannelListGroup) => serverChannelListGroup.id);

        const channels = await this.fetch(channelIdList, opts);

        channels
          .filter(Boolean)
          .forEach((channel, index) => {
            channel.isMember = true;
            channel.capabilities = response.body[index].capabilities;
          });
      }

      return this.store.filter((item) => item.isMember);
    }

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),
          subscribe: validator => validator
            .isNotRequired()
            .isBoolean(),
          entities: validator => validator
            .isNotRequired()
            .isArray()
            .each()
            .in(Object.values(ChannelEntities))
        }
      );

    // Developer provided a name
    if (!Array.isArray(normalisedChannelIdOrName) && isNaN(normalisedChannelIdOrName)) {
      if (!opts?.forceNew) {
        const cached = this.store.find((item) => this.client.utility.string.isEqual(item.name, normalisedChannelIdOrName) && opts?.entities
          ? opts.entities.some((entity) => !(entity in item))
          : true);

        if (cached) { return cached; }
      }
      try {
        const response = await this.client.websocket.emit(
          'group profile',
          {
            headers: {
              version: 4
            },
            body: {
              name: normalisedChannelIdOrName.toLowerCase(),
              subscribe: opts?.subscribe ?? true,
              entities: opts?.entities ?? ['base']
            }
          }
        );

        return this.store.set(new Channel(this.client, response.body), response.headers?.maxAge);
      } catch (error) {
        if (error.code === StatusCodes.NOT_FOUND) {
          this.store.delete((item) => this.client.utility.string.isEqual(item.name, normalisedChannelIdOrName));
          return null;
        }
        throw error;
      }
    }

    const isArrayResponse = Array.isArray(normalisedChannelIdOrName);
    const normalisedChannelIds = this.normaliseNumbers(normalisedChannelIdOrName);

    const idsToFetch = opts?.forceNew
      ? normalisedChannelIds
      : normalisedChannelIds.filter(channelId => {
        const cached = this.store.get(channelId);
        return !cached || (opts?.entities && opts.entities.some(entity => !(entity in cached)));
      });

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'group profile',
        {
          headers: {
            version: 4
          },
          body: {
            idList: idsToFetch,
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? ['base']
          }
        }
      );

      for (const [index, childResponse] of response.body.entries()) {
        const id = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.store.set(
          new Channel(this.client, childResponse.body),
          response.headers?.maxAge
        );
      }
    }

    const channels = normalisedChannelIds.map((id) => this.store.get((item) => item.id === id));

    return isArrayResponse
      ? channels
      : channels[0];
  }

  async history (channelId, chronological, timestamp, limit) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedTimestamp = this.normaliseNumber(timestamp);
    const normalisedLimit = this.normaliseNumber(limit);

    const channel = await this.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!channel.isMember && !channel.peekable) { throw new Error(`Channel with ID ${channel.id} is not peekable`); }

    try {
      const response = await this.client.websocket.emit(
        'message group history list',
        {
          headers: {
            version: 3
          },
          body: {
            id: normalisedChannelId,
            limit: normalisedLimit,
            chronological,
            timestampEnd: normalisedTimestamp
          }
        }
      );

      return response.body.map(serverMessage => new Message(this.client, serverMessage));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }
      throw error;
    }
  }

  async join (channelIdOrName, password) {
    const normalisedChannelIdOrName = this.normaliseNumber(channelIdOrName);
    const isById = normalisedChannelIdOrName instanceof Number;

    return this.client.websocket.emit(
      'group member add',
      {
        body: {
          // eslint-disable-next-line custom/ternary-formatting
          [isById ? 'name' : 'id']: isById ? normalisedChannelIdOrName : normalisedChannelIdOrName.toLowerCase(),
          password
        }
      }
    );
  }

  async leave (channelIdOrName) {
    const normalisedChannelIdOrName = this.normaliseNumber(channelIdOrName);
    const isById = normalisedChannelIdOrName instanceof Number;

    const channel = await this.fetch(normalisedChannelIdOrName);

    if (!channel) {
      // eslint-disable-next-line custom/ternary-formatting
      throw new Error(`Channel with ${isById ? 'ID' : 'Name'} ${normalisedChannelIdOrName} Not Found`);
    }

    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    return this.client.websocket.emit(
      'group member delete',
      {
        body: {
          groupId: channel.id
        }
      }
    );
  }

  async search (query) {
    validate(query, this, this.search)
      .isNotNullOrUndefined()
      .isNotWhitespace();

    try {
      const response = await this.client.websocket.emit(
        'search',
        {
          body: {
            query,
            types: ['groups']
          }
        }
      );

      return response.body?.map(serverSearch => new Search(this.client, serverSearch));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }
      throw error;
    }
  }
}

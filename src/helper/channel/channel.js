import BaseHelper from '../baseHelper.js';
import Channel from '../../entities/channel.js';
import ChannelCategoryHelper from './channelCategory.js';
import ChannelMemberHelper from './channelMember.js';
import ChannelRoleHelper from './channelRole.js';
import ChannelStats from '../../entities/channelStats.js';
import { Command } from '../../constants/Command.js';
import { defaultChannelEntities } from '../../options/options.js';
import IdHash from '../../entities/idHash.js';
import { Message } from '../../entities/message.js';
import Search from '../../entities/search.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validator/index.js';

class ChannelHelper extends BaseHelper {
  #category;
  #member;
  #roles;
  constructor (client) {
    super(client);

    this.#category = new ChannelCategoryHelper(client);
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

  async getById (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.getById() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.getById() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.getById() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([channelId], opts))[0];
  }

  async getByIds (channelIds, opts) {
    channelIds = channelIds.map((channelId) => Number(channelId) || channelId);

    { // eslint-disable-line no-lone-blocks
      validate(channelIds)
        .isArray(`ChannelHelper.getByIds() parameter, channelIds: ${channelIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is null or undefined')
        .isValidNumber('ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelHelper.getByIds() parameter, opts.{parameter}: {value} {error}');// TODO: entities
    }

    const idsToFetch = opts?.forceNew
      ? channelIds
      : channelIds.filter((channelId) =>
        !this.store.has((channel) => channel.id === channelId)
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.GROUP_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            idList: idsToFetch,
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? defaultChannelEntities
          }
        }
      );

      for (const [index, channelResponse] of response.body.entries()) {
        const channelId = idsToFetch[index];

        if (!channelResponse.success) {
          this.store.delete((channel) => channel.id === channelId);
          continue;
        }

        this.store.set(
          new Channel(this.client, channelResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return channelIds.map((channelId) =>
      this.store.get((channel) => channel.id === channelId)
    );
  }

  async getByName (name, opts) {
    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`ChannelHelper.getByName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.getByName() parameter, name: ${name} is empty or whitespace`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelHelper.getByName() parameter, opts.{parameter}: {value} {error}'); // TODO: entities
    }

    if (!opts?.forceNew) {
      const cached = this.store.find((channel) => channel.name.toLowerCase() === name.toLowerCase());

      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.GROUP_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            name: name.toLowerCase(),
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? defaultChannelEntities
          }
        }
      );

      return this.store.set(new Channel(this.client, response.body), response.headers?.maxAge);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async getChatHistory (channelId, chronological = false, timestamp, limit = 100) {
    channelId = Number(channelId) || channelId;
    timestamp = Number(timestamp) || timestamp;
    limit = Number(limit) || limit;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.getChatHistory() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.getChatHistory() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.getChatHistory() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(chronological)
        .isBoolean(`ChannelHelper.getChatHistory() parameter, chronological: ${chronological} is not a valid boolean`);

      validate(timestamp)
        .isNotRequired()
        .isNotNullOrUndefined(`ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is less than or equal to zero`);

      validate(limit)
        .isNotNullOrUndefined(`ChannelHelper.getChatHistory() parameter, limit: ${limit} is null or undefined`)
        .isValidNumber(`ChannelHelper.getChatHistory() parameter, limit: ${limit} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.getChatHistory() parameter, limit: ${limit} is less than or equal to zero`);
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!channel.isMember && !channel.peekable) { throw new Error(`Channel ${channelId} is not peekable`); }

    try {
      const response = await this.client.websocket.emit(
        Command.MESSAGE_GROUP_HISTORY_LIST,
        {
          headers: {
            version: 3
          },
          body: {
            id: channelId,
            limit,
            chronological,
            timestampEnd: timestamp
          }
        }
      );

      return response.body.map(serverMessage => new Message(this.client, serverMessage));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }
      throw error;
    }
  }

  async getStats (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.getStats() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.getStats() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.getStats() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'ChannelHelper.getStats() parameter, opts.{parameter}: {value} {error}');
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(`Channel with ID ${channelId} Not Found`); }

    if (!opts?.forceNew && channel.statsStore.fetched) { return channel.statsStore.value(); }

    const response = await this.client.websocket.emit(
      Command.GROUP_STATS,
      {
        body: {
          id: channelId
        }
      }
    );

    channel.statsStore.value = new ChannelStats(this.client, response.body);
    return channel.stats;
  }

  async getRecommendations () {
    const response = await this.client.websocket.emit(Command.GROUP_RECOMMENDATION_LIST);
    return response?.body.map(serverIdHash => new IdHash(this.client, serverIdHash, true));
  }

  async joinById (channelId, password) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.joinById() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.joinById() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.joinById() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(password)
        .isNotRequired()
        .isNotNull(`ChannelHelper.joinById() parameter, password: ${password} is null`)
        .isNotEmptyOrWhitespace(`ChannelHelper.joinById() parameter, password: ${password} is empty or whitespace`);
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(`Channel with ID ${channelId} Not Found`); }
    if (channel.isMember) { throw new Error(`Already member of Channel with id ${channelId}`); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        body: {
          groupId: channelId,
          password
        }
      }
    );
  }

  async joinByName (name, password) {
    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`ChannelHelper.joinByName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.joinByName() parameter, name: ${name} is empty or whitespace`);

      validate(password)
        .isNotRequired()
        .isNotNull(`ChannelHelper.joinByName() parameter, password: ${password} is null`)
        .isNotEmptyOrWhitespace(`ChannelHelper.joinByName() parameter, password: ${password} is empty or whitespace`);
    }
    const channel = await this.getByName(name);
    if (!channel) { throw new Error(`Channel with Name ${name} Not Found`); }
    if (channel.isMember) { throw new Error(`Already member of Channel with id ${channel.id}`); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        body: {
          name: name.toLowerCase(),
          password
        }
      }
    );
  }

  async leaveById (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.leaveById() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.leaveById() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelHelper.leaveById() parameter, channelId: ${channelId} is less than or equal to zero`);
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(`Channel with ID ${channelId} Not Found`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with id ${channel.id}`); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channelId
        }
      }
    );
  }

  async leaveByName (name) {
    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`ChannelHelper.leaveByName() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.leaveByName() parameter, name: ${name} is empty or whitespace`);
    }
    const channel = await this.getByName(name);
    if (!channel) { throw new Error(`Channel with Name ${name} Not Found`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with id ${channel.id}`); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channel.id
        }
      }
    );
  }

  // TODO: if we disconnect from the server, all this cache is lost, rework this so that inChannel channels are not lost upon reconnect and
  // are handled appropriately upon reconnection
  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts?.forceNew && this.store.fetched) {
      return this.store.filter((channel) => channel.isMember);
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.store.fetched = true;

    if (response.body.length) {
      const channels = await this.getByIds(response.body.map((group) => group.id));

      channels
        .filter(Boolean)
        .forEach((channel, index) => {
          channel.isMember = true;
          channel.capabilities = response.body[index].capabilities;
        });
    }

    return this.store.filter((channel) => channel.isMember);
  }

  async search (query) {
    { // eslint-disable-line no-lone-blocks
      validate(query)
        .isNotNullOrUndefined(`ChannelHelper.search() parameter, query: ${query} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.search() parameter, query: ${query} is empty or whitespace`);
    }
    try {
      const response = await this.client.websocket.emit(
        Command.SEARCH,
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

export default ChannelHelper;

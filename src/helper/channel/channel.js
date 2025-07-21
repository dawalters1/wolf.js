import BaseHelper from '../baseHelper.js';
import Channel from '../../entities/channel.js';
import ChannelCategoryHelper from './channelCategory.js';
import ChannelMemberHelper from './channelMember.js';
import ChannelRoleHelper from './channelRole.js';
import ChannelStats from '../../entities/channelStats.js';
import { Command } from '../../constants/Command.js';
import { defaultChannelEntities } from '../../options/requestOptions.js';
import IdHash from '../../entities/idHash.js';
import { Message } from '../../entities/message.js';
import Search from '../../entities/search.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validator/index.js';

class ChannelHelper extends BaseHelper {
  constructor (client) {
    super(client);
    this.category = new ChannelCategoryHelper(client);
    this.member = new ChannelMemberHelper(client);
    this.role = new ChannelRoleHelper(client);
  }

  async getById (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelHelper.getById() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelHelper.getById() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`ChannelHelper.getById() parameter, channelId: ${channelId} is less than or equal to zero`);

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
        .isValidArray(`ChannelHelper.getByIds() parameter, channelIds: ${channelIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is null or undefined')
        .isValidNumber('ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('ChannelHelper.getByIds() parameter, channelId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ChannelHelper.getByIds() parameter, opts.{parameter}: {value} {error}');// TODO: entities
    }

    const channelsMap = new Map();

    if (!opts?.forceNew) {
      const cachedChannels = this.cache.getAll(channelIds).filter(c => c !== null);
      cachedChannels.forEach(channel => channelsMap.set(channel.id, channel));
    }

    const idsToFetch = channelIds.filter(id => !channelsMap.has(id));

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

      for (const [channelId, channelResponse] of response.body.entries()) {
        if (!channelResponse.success) { continue; }

        const existing = this.cache.get(channelId);
        channelsMap.set(
          channelId,
          this.cache.set(
            existing
              ? existing.patch(channelResponse.body)
              : new Channel(this.client, channelResponse.body)
          )
        );
      }
    }

    return channelIds.map(id => channelsMap.get(id) ?? null);
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
      const cached = [...this.cache.values()].find(channel => channel.name.toLowerCase().trim() === name.toLowerCase().trim()) ?? null;
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

      const existing = [...this.cache.values()].find(channel => channel.name.toLowerCase().trim() === name.toLowerCase().trim()) ?? null;

      return this.cache.set(
        existing
          ? existing.patch(response.body)
          : new Channel(this.client, response.body)
      );
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
        .isGreaterThanZero(`ChannelHelper.getChatHistory() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(chronological)
        .isBoolean(`ChannelHelper.getChatHistory() parameter, chronological: ${chronological} is not a valid boolean`);

      validate(timestamp)
        .isNotRequired()
        .isNotNullOrUndefined(`ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThanZero(`ChannelHelper.getChatHistory() parameter, timestamp: ${timestamp} is less than or equal to zero`);

      validate(limit)
        .isNotNullOrUndefined(`ChannelHelper.getChatHistory() parameter, limit: ${limit} is null or undefined`)
        .isValidNumber(`ChannelHelper.getChatHistory() parameter, limit: ${limit} is not a valid number`)
        .isGreaterThanZero(`ChannelHelper.getChatHistory() parameter, limit: ${limit} is less than or equal to zero`);
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

      return response.body?.map(serverMessage => new Message(this.client, serverMessage));
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
        .isGreaterThanZero(`ChannelHelper.getStats() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'ChannelHelper.getStats() parameter, opts.{parameter}: {value} {error}');
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }

    if (!opts?.forceNew && channel._stats.fetched) { return channel.stats; }

    const response = await this.client.websocket.emit(
      Command.GROUP_STATS,
      {
        body: {
          id: channelId
        }
      }
    );

    channel._stats.value = channel.stats?.patch(response.body) ?? new ChannelStats(this.client, response.body);
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
        .isGreaterThanZero(`ChannelHelper.joinById() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(password)
        .isNotRequired()
        .isNotNull(`ChannelHelper.joinById() parameter, password: ${password} is null`)
        .isNotEmptyOrWhitespace(`ChannelHelper.joinById() parameter, password: ${password} is empty or whitespace`);
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }
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
    if (!channel) { throw new Error(); }
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
        .isGreaterThanZero(`ChannelHelper.leaveById() parameter, channelId: ${channelId} is less than or equal to zero`);
    }
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }
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
    if (!channel) { throw new Error(); }
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
    if (!opts?.forceNew && this.cache.fetched) {
      return [...this.cache.values()].filter(channel => channel.isMember);
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.cache.fetched = true;

    if (response.body.length) {
      const channels = await this.getByIds(response.body.map(g => g.id));
      channels.filter(Boolean).forEach((channel, i) => {
        channel.isMember = true;
        channel.capabilities = response.body[i].capabilities;
      });
    }

    return [...this.cache.values()].filter(channel => channel.isMember);
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

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

class ChannelHelper extends BaseHelper {
  constructor (client) {
    super(client);
    this.category = new ChannelCategoryHelper(client);
    this.member = new ChannelMemberHelper(client);
    this.role = new ChannelRoleHelper(client);
  }

  async getById (channelId, opts) {
    return (await this.getByIds([channelId], opts))[0];
  }

  async getByIds (channelIds, opts) {
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
            existing ? existing.patch(channelResponse.body) : new Channel(this.client, channelResponse.body)
          )
        );
      }
    }

    return channelIds.map(id => channelsMap.get(id) ?? null);
  }

  async getByName (name, opts) {
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
        existing ? existing.patch(response.body) : new Channel(this.client, response.body)
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async getChatHistory (channelId, chronological = false, timestamp, limit = 100) {
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }

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
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }
    if (channel.isMember) { throw new Error(); }

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

  async joinByName (channelName, password) {
    const channel = await this.getByName(channelName);
    if (!channel) { throw new Error(); }
    if (channel.isMember) { throw new Error(); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        body: {
          name: channelName.toLowerCase(),
          password
        }
      }
    );
  }

  async leaveById (channelId) {
    const channel = await this.getById(channelId);
    if (!channel) { throw new Error(); }
    if (!channel.isMember) { throw new Error(); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channelId
        }
      }
    );
  }

  async leaveByName (channelName) {
    const channel = await this.getByName(channelName);
    if (!channel) { throw new Error(); }
    if (!channel.isMember) { throw new Error(); }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channel.id
        }
      }
    );
  }

  async list (opts) {
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

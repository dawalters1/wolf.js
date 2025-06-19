
import BaseHelper from '../baseHelper.ts';
import Channel, { ServerGroupModular } from '../../structures/channel.ts';
import ChannelCategoryHelper from './channelCategory.ts';
import { ChannelListOptions, ChannelOptions, ChannelStatsOptions, defaultChannelEntities } from '../../options/requestOptions.ts';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.ts';
import ChannelMemberHelper from './channelMember.ts';
import ChannelRoleHelper from './channelRole.ts';
import ChannelStats, { ServerGroupStats } from '../../structures/channelStats';
import { Command } from '../../constants/Command.ts';
import IdHash, { ServerIdHash } from '../../structures/idHash';
import { Message, ServerMessage } from '../../structures/message';
import Search, { ServerSearch } from '../../structures/search';
import { StatusCodes } from 'http-status-codes';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class ChannelHelper extends BaseHelper<Channel> {
  readonly category: ChannelCategoryHelper;
  readonly member: ChannelMemberHelper;
  readonly role: ChannelRoleHelper;

  constructor (client:WOLF) {
    super(client);

    this.category = new ChannelCategoryHelper(client);
    this.member = new ChannelMemberHelper(client);
    this.role = new ChannelRoleHelper(client);
  }

  async getById (channelId: number, opts?: ChannelOptions): Promise<Channel | null> {
    return (await this.getByIds([channelId], opts))[0];
  }

  async getByIds (channelIds: number[], opts?: ChannelOptions): Promise<(Channel | null)[]> {
    const channelsMap = new Map<number, Channel | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedChannels = this.cache.getAll(channelIds)
        .filter((channel): channel is Channel => channel !== null);

      cachedChannels.forEach((channel) => channelsMap.set(channel.id, channel));
    }

    const idsToFetch = channelIds.filter((id) => !channelsMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerGroupModular>>>(
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

      [...response.body.entries()]
        .filter(([, channelResponse]) => channelResponse.success)
        .forEach(([channelId, channelResponse]) => {
          const existing = this.cache.get(channelId);

          channelsMap.set(
            channelId,
            this.cache.set(
              existing
                ? existing.patch(channelResponse.body)
                : new Channel(this.client, channelResponse.body)
            )
          );
        });
    }

    return channelIds.map((channelId) => channelsMap.get(channelId) ?? null);
  }

  async getByName (name: string, opts?: ChannelOptions): Promise<Channel | null> {
    if (!opts?.forceNew) {
      const cached = this.cache.values().find((channel) => channel.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()) ?? null;
      if (cached !== null) {
        return cached;
      }
    }

    try {
      const response = await this.client.websocket.emit<ServerGroupModular>(
        Command.GROUP_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            name: name.toLocaleLowerCase(),
            subscribe: opts?.subscribe ?? true,
            entities: opts?.entities ?? defaultChannelEntities
          }
        }
      );

      const existing = this.cache.values().find((channel) => channel.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()) ?? null;

      return this.cache.set(
        existing?.patch(response.body) ??
        new Channel(this.client, response.body)
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async getChatHistory (channelId: number, chronological?: false, timestamp?: number, limit?: 100): Promise<Message[]> {
    const channel = await this.getById(channelId);

    if (channel === null) { throw new Error(); }

    if (!channel.isMember) {
      if (!channel.peekable) {
        throw new Error(`Channel with id ${channelId} is not peekable`);
      }
    }

    try {
      const response = await this.client.websocket.emit<ServerMessage[]>(
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

      return response.body?.map((serverMessage) => new Message(this.client, serverMessage));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }
      throw error;
    }
  }

  async getStats (channelId: number, opts?: ChannelStatsOptions): Promise<ChannelStats | null> {
    const channel = await this.getById(channelId);

    if (channel === null) { throw new Error(''); }

    if (!opts?.forceNew && channel._stats.fetched) {
      return channel.stats;
    }

    const response = await this.client.websocket.emit<ServerGroupStats>(
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
    const response = await this.client.websocket.emit<ServerIdHash[]>(
      Command.GROUP_RECOMMENDATION_LIST
    );

    return response?.body.map((serverIdHash) => new IdHash(this.client, serverIdHash, true));
  }

  async joinById (channelId: number, password?: string): Promise<WOLFResponse> {
    const channel = await this.getById(channelId);

    if (channel === null) { throw new Error(''); }
    if (channel.isMember) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        body: {
          groupId: channelId,
          password
        }
      }
    );
  }

  async joinByName (channelName: string, password?: string): Promise<WOLFResponse> {
    const channel = await this.getByName(channelName);

    if (channel === null) { throw new Error(''); }
    if (channel.isMember) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_ADD,
      {
        body: {
          name: channelName.toLocaleLowerCase(),
          password
        }
      }
    );
  }

  async leaveById (channelId: number): Promise<WOLFResponse> {
    const channel = await this.getById(channelId);

    if (channel === null) { throw new Error(''); }
    if (!channel.isMember) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channelId
        }
      }
    );
  }

  async leaveByName (channelName: string): Promise<WOLFResponse> {
    const channel = await this.getByName(channelName);

    if (channel === null) { throw new Error(''); }
    if (!channel.isMember) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channel.id
        }
      }
    );
  }

  async list (opts?: ChannelListOptions) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values().filter((channel) => channel.isMember);
    }

    const response = await this.client.websocket.emit<any[]>(
      Command.SUBSCRIBER_GROUP_LIST,
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.cache.fetched = true;

    if (response.body.length) {
      const channels = await this.getByIds(response.body.map((ServerGroup) => ServerGroup.id as number));

      channels
        .filter((channel): channel is Channel => channel !== null)
        .forEach((channel, index) => {
          channel.isMember = true;
          channel.capabilities = response.body[index].capabilities as ChannelMemberCapability;
        }
        );
    }

    return this.cache.values().filter((channel) => channel.isMember);
  }

  async search (query: string): Promise<(Search | null)[]> {
    try {
      const response = await this.client.websocket.emit<ServerSearch[]>(
        Command.SEARCH,
        {
          body: {
            query,
            types: ['groups']
          }
        }
      );

      return response.body?.map((serverSearch) => new Search(this.client, serverSearch));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }
      throw error;
    }
  }
}

export default ChannelHelper;

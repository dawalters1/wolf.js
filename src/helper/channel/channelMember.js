import ChannelMember from '../../entities/channelMember.js';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.js';
import { ChannelMemberListType } from '../../constants/ChannelMemberListType.js';
import { Command } from '../../constants/Command.js';
import { StatusCodes } from 'http-status-codes';

class ChannelMemberHelper {
  constructor (client) {
    this.client = client;
  }

  async _getList (channel, list) {
    if (channel._members.metadata[list]) {
      return channel._members.values().filter(m => m.lists.has(list));
    }

    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);
    const command = this._getCommandForList(list);

    const fetchMembers = async (result = []) => {
      try {
        const response = await this.client.websocket.emit(
          command,
          {
            body: {
              id: channel.id,
              limit: listConfig.limit,
              after: listConfig.batchType === 'after'
                ? result.at(-1)?.id
                : undefined,
              filter: listConfig.batchType === 'offset'
                ? list
                : undefined,
              offset: listConfig.batchType === 'offset'
                ? result.length
                : undefined,
              subscribe: 'subscribe' in listConfig
                ? listConfig.subscribe
                : undefined
            }
          }
        );

        result.push(...response.body.map(serverMember => {
          serverMember.channelId = channel.id;

          const existing = channel._members.get(serverMember.id);

          return channel._members.set(
            existing
              ? existing.patch(serverMember, list)
              : new ChannelMember(this.client, serverMember, list)
          );
        }));

        const complete = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        channel._members.metadata[list] = complete;

        return complete
          ? result
          : await fetchMembers(result);
      } catch (err) {
        if (err.code === StatusCodes.NOT_FOUND) { return []; }
        throw err;
      }
    };

    return fetchMembers();
  }

  _getCommandForList (list) {
    switch (list) {
      case ChannelMemberListType.PRIVILEGED: return Command.GROUP_MEMBER_PRIVILEGED_LIST;
      case ChannelMemberListType.REGULAR: return Command.GROUP_MEMBER_REGULAR_LIST;
      case ChannelMemberListType.SILENCED:
      case ChannelMemberListType.BOTS: return Command.GROUP_MEMBER_SEARCH;
      case ChannelMemberListType.BANNED: return Command.GROUP_MEMBER_BANNED_LIST;
      default: throw new Error(`Unknown list type: ${list}`);
    }
  }

  async getList (channelId, list) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }
    return this._getList(channel, list);
  }

  async getMember (channelId, userId) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }

    const cached = channel._members.get(userId);
    if (cached) { return cached; }

    try {
      const response = await this.client.websocket.emit(
        Command.GROUP_MEMBER,
        {
          body: {
            groupId: channel.id,
            subscriberId: userId
          }
        }
      );

      return channel._members.set(
        new ChannelMember(
          this.client,
          {
            ...response.body,
            channelId,
            hash: (await this.client.user.getById(userId)).hash
          }
        )
      );
    } catch (err) {
      if (err.code === StatusCodes.NOT_FOUND) { return null; }
      throw err;
    }
  }

  async updateCapability (channelId, userId, target, allowedFrom) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }

    const member = await this.getMember(channelId, userId);
    if (!member) { throw new Error('Member not found'); }

    if (!await channel.canPerformActionAgainstMember(member, target)) {
      throw new Error(`Insufficient permissions to change capability to ${ChannelMemberCapability[target]}`);
    }

    if (!allowedFrom.includes(member.capabilities)) {
      throw new Error(`Invalid transition from ${ChannelMemberCapability[member.capabilities]} to ${ChannelMemberCapability[target]}`);
    }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: target
        }
      }
    );
  }

  coowner (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.CO_OWNER, [
      ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  admin (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.ADMIN, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  mod (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.MOD, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.REGULAR
    ]);
  }

  regular (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.REGULAR, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.SILENCED
    ]);
  }

  silence (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.SILENCED, [
      ChannelMemberCapability.REGULAR
    ]);
  }

  ban (channelId, userId) {
    return this.updateCapability(channelId, userId, ChannelMemberCapability.BANNED, [
      ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED
    ]);
  }

  async kick (channelId, userId) {
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }

    const member = await this.getMember(channelId, userId);
    if (!member) { throw new Error('Member not found'); }

    if (!await channel.canPerformActionAgainstMember(member, ChannelMemberCapability.BANNED)) {
      throw new Error('Insufficient permissions to kick member');
    }

    if (![ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(member.capabilities)) {
      throw new Error('Kick not permitted for current capability');
    }

    return this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        body: {
          groupId: channelId,
          id: userId
        }
      }
    );
  }
}

export default ChannelMemberHelper;

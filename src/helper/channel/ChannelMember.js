'use strict';

// Node dependencies
// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Privilege, Capability } from '../../constants/index.js';
import ChannelMemberListType from '../../constants/ChannelMemberListType.js';

// no idea if this works, in my brain it should?

const canPerformChannelAction = async (client, channel, targetMember, targetCapability) => {
  if (targetCapability === Capability.OWNER) { return false; }

  if (channel.isOwner) { return true; }

  const sourceMemberHasGap = await client.utility.user.privilege.has(client.user, Privilege.GROUP_ADMIN);

  if (targetCapability === Capability.CO_OWNER) {
    if (sourceMemberHasGap) { return true; }

    return false;
  }

  const isSourceMemberCapabilityHigher = sourceMemberHasGap ?? (() => {
    switch (channel.myCapability) {
      case Capability.CO_OWNER:
        return [Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.NOT_MEMBER, Capability.BANNED, Capability.NONE].includes(targetMember.capabilites);
      case Capability.ADMIN:
        if (channel.extended.advancedAdmin) {
          return [Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NONE].includes(targetMember.capabilites);
        }

        return [Capability.MOD, Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NONE].includes(targetMember.capabilites);
      case Capability.MOD:
        return [Capability.REGULAR, Capability.SILENCED, Capability.BANNED, Capability.NONE].includes(targetMember.capabilites);
      default:
        return false;
    }
  });

  const targetMemberHasGap = await client.utility.user.privilege.has(targetMember.id, Privilege.GROUP_ADMIN);

  if ([Capability.SILENCED, Capability.BANNED].includes(targetCapability) && targetMemberHasGap) { return false; }

  return isSourceMemberCapabilityHigher;
};

class ChannelMember extends Base {
  /**
   *
   * @param {import('../../structures/Channel.js').default} channel
   * @returns
   */
  async _getList (channel, list) {
    // Entirety of requested list has been cached, return it
    if (channel.members._metadata[list]) {
      return channel.members.cache
        .values()
        .filter((member) => member.lists.includes(list));
    }

    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);

    // Determine which command to use
    const command = (() => {
      switch (list) {
        case ChannelMemberListType.PRIVILEGED:
          return Command.GROUP_MEMBER_PRIVILEGED_LIST;
        case ChannelMemberListType.REGULAR:
          return Command.GROUP_MEMBER_REGULAR_LIST;
        case ChannelMemberListType.SILENCED:
          return Command.GROUP_MEMBER_SEARCH;
        case ChannelMemberListType.BANNED:
          return Command.GROUP_MEMBER_BANNED_LIST;
        case ChannelMemberListType.BOTS:
          return Command.GROUP_MEMBER_SEARCH;
        default:
          throw new Error(`Unknown list type ${list}`);
      }
    })();

    const get = async (members = []) => {
      try {
        const response = await this.client.websocket.emit(
          command,
          {
            body: {
              id: channel.id,
              limit: listConfig.limit,
              // GROUP_MEMBER_*_LIST list batching
              after: listConfig.batchType === 'after'
                ? (members.slice(-1)[0]?.id ?? undefined)
                : undefined,
              // GROUP_MEMBER_SEARCH batching
              filter: listConfig.batchType === 'offset'
                ? list
                : undefined,
              // GROUP_MEMBER_SEARCH batching
              offset: listConfig.batchType === 'offset'
                ? members.length
                : undefined,
              // Whether a list can be subscribed to
              subscribe: Reflect.has(listConfig, 'subscribe')
                ? listConfig.subscribe
                : undefined
            }
          }
        );

        channel.members._metadata[list] = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        members.push(
          ...response.body
            .map((member) =>
              channel.members._add(new structures.ChannelMember(this.client, member, list))
            )
        );

        return channel.members._metadata[list]
          ? members
          : await get(members);
      } catch (error) {
        // Handle
        if (error.code === StatusCodes.NOT_FOUND) { return []; }
        throw error;
      }
    };

    return await get();
  }

  /**
   *
   * @param {import('../../structures/Channel.js').default} channel
   * @param {*} userId
   * @returns
   */
  async _getMember (channel, userId) {
    const cached = channel.members.get(userId);

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

      return channel.members._add(new structures.ChannelMember(this.client, response.body));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async get (channelId, userIdOrChannelListMemberType) {
    channelId = Number(channelId) || channelId;
    userIdOrChannelListMemberType = Object.values(ChannelMemberListType).includes(userIdOrChannelListMemberType) ? userIdOrChannelListMemberType : (Number(userIdOrChannelListMemberType) || userIdOrChannelListMemberType);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.get() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.get() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userIdOrChannelListMemberType)) {
        if (!Object.values(ChannelMemberListType).includes(userIdOrChannelListMemberType)) {
          throw new Error(`ChannelMember.get() parameter, channelListMemberType: ${JSON.stringify(userIdOrChannelListMemberType)}, not a valid enum`);
        }
      } else if (verify.isLessThanOrEqualZero(userIdOrChannelListMemberType)) {
        throw new Error(`ChannelMember.get() parameter, userId: ${JSON.stringify(userIdOrChannelListMemberType)}, is zero or negative`);
      }
    }

    const isUserFetch = (String)(typeof userIdOrChannelListMemberType) === 'number';

    const channel = this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    if (!channel.isMember) { throw new Error(); }

    if (isUserFetch) { return await this._getMember(channel, userIdOrChannelListMemberType); }

    return await this._getList(channel, userIdOrChannelListMemberType);
  }

  async coowner (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.coowner() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.coowner() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.coowner() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.coowner() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.CO_OWNER)) { throw new Error(''); }

    if (![Capability.ADMIN, Capability.MOD, Capability.REGULAR].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.CO_OWNER
        }
      }
    );
  }

  async admin (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.admin() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.admin() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.admin() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.admin() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.ADMIN)) { throw new Error(''); }

    if (![Capability.CO_OWNER, Capability.MOD, Capability.REGULAR].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.ADMIN
        }
      }
    );
  }

  async mod (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.mod() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.mod() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.mod() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.mod() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.MOD)) { throw new Error(''); }

    if (![Capability.CO_OWNER, Capability.ADMIN, Capability.REGULAR].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.MOD
        }
      }
    );
  }

  async regular (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.regular() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.regular() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.regular() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.regular() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.REGULAR)) { throw new Error(''); }

    if (![Capability.CO_OWNER, Capability.ADMIN, Capability.MOD, Capability.SILENCED].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.REGULAR
        }
      }
    );
  }

  async silence (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.silence() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.silence() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.silence() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.silence() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.SILENCED)) { throw new Error(''); }

    if (![Capability.SILENCED].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.SILENCED
        }
      }
    );
  }

  async kick (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.kick() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.kick() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.kick() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.kick() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.NONE)) { throw new Error(''); }

    if (![Capability.REGULAR, Capability.SILENCED, Capability.BANNED].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_DELETE,
      {
        groupId: channelId,
        subscriberId: userId
      }
    );
  }

  async ban (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`ChannelMember.ban() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`ChannelMember.ban() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(userId)) {
        throw new Error(`ChannelMember.ban() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`ChannelMember.ban() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error(); }

    const member = await this.get(channelId, userId);

    if (member === null) { throw new Error(''); }

    if (!canPerformChannelAction(channel, member, Capability.BANNED)) { throw new Error(''); }

    if (![Capability.REGULAR, Capability.SILENCED].includes(member.capabilites)) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_MEMBER_UPDATE,
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: Capability.BANNED
        }
      }
    );
  }
}

export default ChannelMember;

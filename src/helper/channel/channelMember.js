import ChannelMember from '../../entities/channelMember.js';
import { ChannelMemberCapability } from '../../constants/ChannelMemberCapability.js';
import { ChannelMemberListType } from '../../constants/ChannelMemberListType.js';
import { Command } from '../../constants/Command.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validator/index.js';

// TODO: if we disconnect from the server briefly all this cache is lost, refactor channel and this so that this is kept
class ChannelMemberHelper {
  constructor (client) {
    this.client = client;
  }

  async _getList (channel, list) {
    if (channel.memberStore.metadata[list]) {
      return channel.memberStore.filter((member) => member.lists.has(list));
    }

    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);
    const command = this._getCommandForList(list);

    const fetchMembers = async (result = []) => {
      try {
        const response = await this.client.websocket.emit(
          command,
          {
            headers: {
              version: listConfig.version
            },
            body: {
              [listConfig.key]: channel.id,
              limit: 'limit' in listConfig
                ? listConfig.limit
                : undefined,
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

        result.push(...response.body.map(
          (serverMember) =>
            channel.memberStore.set(
              new ChannelMember(this.client, serverMember, channel.id, list),
              response.headers?.maxAge
            )
        )
        );

        const complete = listConfig.batched
          ? response.body.length < listConfig.limit
          : true;

        channel.memberStore.metadata[list] = complete;

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
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.getList() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.getList() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.getList() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(list)
        .isNotNullOrUndefined(`ChannelMemberHelper.getList() parameter, list: ${list} is null or undefined`)
        .isValidConstant(ChannelMemberListType, `ChannelMemberHelper.getList() parameter, list: ${list} is not valid`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }
    return this._getList(channel, list);
  }

  async getMember (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.getMember() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.getMember() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.getMember() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.getMember() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.getMember() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.getMember() parameter, userId: ${userId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (!channel) { throw new Error(`Channel ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Not a member of channel ${channelId}`); }

    const cached = channel.memberStore.get(userId);
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

      return channel.memberStore.set(
        new ChannelMember(
          this.client,
          {
            ...response.body,
            hash: (await this.client.user.getById(userId)).hash
          },
          channelId
        )
      );
    } catch (err) {
      if (err.code === StatusCodes.NOT_FOUND) { return null; }
      throw err;
    }
  }

  async #updateCapability (channelId, userId, target, allowedFrom) {
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
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.coowner() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.coowner() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.coowner() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.coowner() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.coowner() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.coowner() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.CO_OWNER, [
      ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  admin (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.admin() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.admin() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.admin() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.admin() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.admin() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.admin() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.ADMIN, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.MOD, ChannelMemberCapability.REGULAR
    ]);
  }

  mod (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.mod() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.mod() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.mod() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.mod() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.mod() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.mod() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.MOD, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.REGULAR
    ]);
  }

  regular (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.regular() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.regular() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.regular() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.regular() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.regular() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.regular() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.REGULAR, [
      ChannelMemberCapability.CO_OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD, ChannelMemberCapability.SILENCED
    ]);
  }

  silence (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.silence() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.silence() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.silence() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.silence() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.silence() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.silence() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.SILENCED, [
      ChannelMemberCapability.REGULAR
    ]);
  }

  ban (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.ban() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.ban() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.ban() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.ban() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.ban() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.ban() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.#updateCapability(channelId, userId, ChannelMemberCapability.BANNED, [
      ChannelMemberCapability.REGULAR, ChannelMemberCapability.SILENCED
    ]);
  }

  async kick (channelId, userId) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`ChannelMemberHelper.kick() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.kick() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.kick() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`ChannelMemberHelper.kick() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ChannelMemberHelper.kick() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ChannelMemberHelper.kick() parameter, userId: ${userId} is less than or equal to zero`);
    }

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

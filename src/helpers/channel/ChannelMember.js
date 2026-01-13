import BaseHelper from '../BaseHelper.js';
import ChannelMember from '../../entities/ChannelMember.js';
import ChannelMemberCapability from '../../constants/ChannelMemberCapability.js';
import ChannelMemberListType from '../../constants/ChannelMemberListType.js';
import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../../constants/UserPrivilege.js';

export default class ChannelMemberHelper extends BaseHelper {
  async #canPerformAction (channel, targetMember, newCapability) {
    if (newCapability === ChannelMemberCapability.OWNER) { return false; }
    if (channel.isOwner) { return true; }

    const sourceMemberHasGap =
      this.client.me?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    const hasHigherCapability = (() => {
      switch (channel.capabilities) {
        case ChannelMemberCapability.CO_OWNER:
          return [
            ChannelMemberCapability.ADMIN,
            ChannelMemberCapability.MOD,
            ChannelMemberCapability.REGULAR,
            ChannelMemberCapability.NONE,
            ChannelMemberCapability.BANNED
          ].includes(targetMember.capabilities);
        case ChannelMemberCapability.ADMIN:
          return channel.extended?.advancedAdmin
            ? [
                ChannelMemberCapability.ADMIN,
                ChannelMemberCapability.MOD,
                ChannelMemberCapability.REGULAR,
                ChannelMemberCapability.SILENCED,
                ChannelMemberCapability.BANNED,
                ChannelMemberCapability.NONE
              ].includes(targetMember.capabilities)
            : [
                ChannelMemberCapability.MOD,
                ChannelMemberCapability.REGULAR,
                ChannelMemberCapability.SILENCED,
                ChannelMemberCapability.BANNED,
                ChannelMemberCapability.NONE
              ].includes(targetMember.capabilities);
        case ChannelMemberCapability.MOD:
          return [
            ChannelMemberCapability.REGULAR,
            ChannelMemberCapability.SILENCED,
            ChannelMemberCapability.BANNED,
            ChannelMemberCapability.NONE
          ].includes(targetMember.capabilities);
        default:
          return false;
      }
    })();

    const targetUser = await this.client.user.fetch(targetMember.id);
    const targetMemberHasGap =
      targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    if (newCapability && [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(newCapability) && targetMemberHasGap) { return false; }

    return sourceMemberHasGap || hasHigherCapability;
  }

  async #fetchList (channel, list) {
    if (channel.memberStore.metadata[list]) {
      return channel.memberStore.filter((item) => item.lists.has(list));
    }

    const listConfig = this.client.config.get(`framework.helper.channel.member.list.${list}`);
    const v3Command = (() => {
      switch (list) {
        case ChannelMemberListType.PRIVILEGED: return 'group member privileged list';
        case ChannelMemberListType.REGULAR: return 'group member regular list';
        case ChannelMemberListType.SILENCED:
        case ChannelMemberListType.BOTS: return 'group member search';
        case ChannelMemberListType.BANNED: return 'group member banned list';
        default: throw new Error(`Unknown list type: ${list}`);
      }
    })();

    // Hard code the limits because developers love to break things
    const limit = (() => {
      switch (list) {
        case ChannelMemberListType.PRIVILEGED: return undefined;
        case ChannelMemberListType.REGULAR: return 100;
        case ChannelMemberListType.SILENCED:
        case ChannelMemberListType.BOTS: return 50;
        case ChannelMemberListType.BANNED: return 50;
        default: throw new Error(`Unknown list type: ${list}`);
      }
    })();

    const batch = async (result = []) => {
      try {
        const response = await this.client.websocket.emit(
          v3Command,
          {
            headers: {
              version: listConfig.version
            },
            body: {
              [listConfig.key]: channel.id,
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
                : undefined,
              ...(limit
                ? {
                    [listConfig.batchType === 'offset'
                      ? 'maxResults'
                      : 'limit']: limit
                  }
                : {})
            }
          }
        );

        result.push(...response.body.map(
          (serverMember) =>
            channel.memberStore.set(
              new ChannelMember(this.client, serverMember, channel.id, list),
              response.headers?.maxAge
            )
        ));

        const complete = limit && listConfig.batched
          ? response.body.length < limit
          : true;

        channel.memberStore.metadata[list] = complete;

        return complete
          ? result
          : await batch(result);
      } catch (err) {
        if (err.code === StatusCodes.NOT_FOUND) { return []; }
        throw err;
      }
    };

    return batch();
  }

  async #fetchMember (channel, memberId, opts) {
    if (!opts?.forceNew) {
      const cached = this.channel.memberStore.get(memberId);
      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        'group member',
        {
          body: {
            groupId: channel.id,
            subscriberId: memberId
          }
        }
      );

      return channel.memberStore.set(
        new ChannelMember(
          this.client,
          {
            ...response.body,
            groupId: channel.id,
            hash: (await this.client.user.getById(memberId)).hash
          }
        )
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async #updateCapability (channelId, userId, newCapabilities, allowedFrom) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    const member = await this.getMember(channelId, userId);
    if (member === null) { throw new Error(`Member with ID ${userId} NOT FOUND in Channel with ID ${channel.id}`); }

    if (!await this.#canPerformAction(channel, member, newCapabilities)) { throw new Error(`Insufficient capabilities to change capability to ${ChannelMemberCapability[newCapabilities]}`); }

    if (!allowedFrom.includes(member.capabilities)) { throw new Error(`Invalid transition from ${ChannelMemberCapability[member.capabilities]} to ${ChannelMemberCapability[newCapabilities]}`); }

    return this.client.websocket.emit(
      'group member update',
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: newCapabilities
        }
      }
    );
  }

  async fetch (channelId, memberIdOrListType, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberIdOrListType = this.normaliseNumber(memberIdOrListType);

    // TODO: validation
    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    if (!isNaN(normalisedMemberIdOrListType)) {
    // TODO: Validate list type
      return this.#fetchList(channel, normalisedMemberIdOrListType);
    }

    // TODO: Validate number
    return this.#fetchMember(channel, normalisedMemberIdOrListType, opts);
  }

  async coowner (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.CO_OWNER,
      [
        ChannelMemberCapability.ADMIN,
        ChannelMemberCapability.MOD,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async admin (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.ADMIN,
      [
        ChannelMemberCapability.CO_OWNER,
        ChannelMemberCapability.MOD,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async mod (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.MOD,
      [
        ChannelMemberCapability.CO_OWNER,
        ChannelMemberCapability.ADMIN,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async regular (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.REGULAR,
      [
        ChannelMemberCapability.CO_OWNER,
        ChannelMemberCapability.ADMIN,
        ChannelMemberCapability.MOD,
        ChannelMemberCapability.SILENCED
      ]
    );
  }

  async silence (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.SILENCED,
      [
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async kick (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.SILENCED,
      [
        ChannelMemberCapability.REGULAR,
        ChannelMemberCapability.SILENCED,
        ChannelMemberCapability.BANNED
      ]
    );
  }

  async ban (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    return this.#updateCapability(
      normalisedChannelId,
      normalisedMemberId,
      ChannelMemberCapability.BANNED,
      [
        ChannelMemberCapability.REGULAR,
        ChannelMemberCapability.SILENCED
      ]
    );
  }
}

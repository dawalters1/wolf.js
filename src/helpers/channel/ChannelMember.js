import BaseHelper from '../BaseHelper.js';
import ChannelMember from '../../entities/ChannelMember.js';
import ChannelMemberCapability from '../../constants/ChannelMemberCapability.js';
import ChannelMemberListType from '../../constants/ChannelMemberListType.js';
import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../../constants/UserPrivilege.js';
import { validate } from '../../validation/Validation.js';

export default class ChannelMemberHelper extends BaseHelper {
  async #fetchList (channel, list) {
    if (channel.memberStore.metadata[list]) {
      return channel.memberStore.filter((item) => item.lists.has(list));
    }

    const listConfig = this.client.config.framework.helper.channel.member.list[`${list}`];
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
    validate(opts, this, this.#fetchMember)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

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
            hash: (await this.client.user.fetch(memberId)).hash
          }
        )
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }
      throw error;
    }
  }

  async #updateCapability (channelId, userId, newCapabilities, allowedFrom) {
    const channel = await this.client.channel.fetch(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    const member = await this.getMember(channelId, userId);
    if (member === null) { throw new Error(`Member with ID ${userId} NOT FOUND in Channel with ID ${channel.id}`); }

    if (!await this.client.utility.channel.member.canPerformActionAgaints(channel, member, newCapabilities)) { throw new Error(`Insufficient capabilities to change capability to ${ChannelMemberCapability[newCapabilities]}`); }

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

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    if (isNaN(normalisedMemberIdOrListType)) {
      validate(normalisedMemberIdOrListType, this, this.fetch)
        .isNotNullOrUndefined()
        .in(Object.values(ChannelMemberListType));

      return this.#fetchList(channel, normalisedMemberIdOrListType);
    }

    validate(normalisedMemberIdOrListType, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return this.#fetchMember(channel, normalisedMemberIdOrListType, opts);
  }

  async coowner (channelId, memberId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedMemberId = this.normaliseNumber(memberId);

    validate(normalisedChannelId, this, this.coowner)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.coowner)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.admin)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.admin)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.mod)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.mod)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.regular)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.regular)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.silence)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.silence)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.kick)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.kick)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

    validate(normalisedChannelId, this, this.ban)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedMemberId, this, this.ban)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

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

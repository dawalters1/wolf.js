import BaseHelper from '../BaseHelper.js';
import ChannelMember from '../../entities/ChannelMember.js';
import ChannelMemberCapability from '../../constants/ChannelMemberCapability.js';
import ChannelMemberListType from '../../constants/ChannelMemberListType.js';
import { StatusCodes } from 'http-status-codes';

export default class ChannelMemberHelper extends BaseHelper {
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
        case ChannelMemberListType.PRIVILEGED: return 2500;
        case ChannelMemberListType.REGULAR: return 100;
        case ChannelMemberListType.SILENCED:return 50;
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
              limit,
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

  async #updateCapability (channelId, userId, target, allowedFrom) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${channel.id}`); }

    const member = await this.getMember(channelId, userId);
    if (member === null) { throw new Error(`Member with ID ${userId} NOT FOUND in Channel with ID ${channel.id}`); }

    // TODO: validation

    return this.client.websocket.emit(
      'group member update',
      {
        body: {
          groupId: channelId,
          id: userId,
          capabilities: target
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

    if (normalisedMemberIdOrListType instanceof Number) {
      // TODO: Validate number
      return this.#fetchMember(channel, normalisedMemberIdOrListType, opts);
    }

    // TODO: Validate list type
    return this.#fetchList(channel, normalisedMemberIdOrListType);
  }

  async coowner (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.CO_OWNER,
      [
        ChannelMemberCapability.ADMIN,
        ChannelMemberCapability.MOD,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async admin (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.ADMIN,
      [
        ChannelMemberCapability.CO_OWNER,
        ChannelMemberCapability.MOD,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async mod (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.MOD,
      [
        ChannelMemberCapability.CO_OWNER,
        ChannelMemberCapability.ADMIN,
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async regular (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
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
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.SILENCED,
      [
        ChannelMemberCapability.REGULAR
      ]
    );
  }

  async kick (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.SILENCED,
      [
        ChannelMemberCapability.REGULAR,
        ChannelMemberCapability.SILENCED,
        ChannelMemberCapability.BANNED
      ]
    );
  }

  async ban (channelId, memberId) {
    return this.#updateCapability(
      channelId,
      memberId,
      ChannelMemberCapability.BANNED,
      [
        ChannelMemberCapability.REGULAR,
        ChannelMemberCapability.SILENCED
      ]
    );
  }
}

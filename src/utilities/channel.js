import BaseUtility from './BaseUtility.js';
import ChannelMemberCapability from '../constants/ChannelMemberCapability.js';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validation/Validation.js';

export default class ChannelUtility extends BaseUtility {
  constructor (client) {
    super(client);

    this.member = {
      hasCapability: async (...args) => this.#hasCapability(args[0], args[1], args[2], args[3], args[4]),
      canPerformActionAgainst: async (...args) => this.#canPerformAction(args[0], args[1], args[2] ?? null)
    };
  }

  async #canPerformAction (channelId, targetMemberId, newCapability = null) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(targetMemberId);
    const normalisedCapability = this.normaliseNumber(newCapability);

    validate(normalisedChannelId, this, this.member.canPerformActionAgainst)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedUserId, this, this.member.canPerformActionAgainst)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedCapability, this, this.member.canPerformActionAgainst)
      .isNotRequired()
      .isNotNullOrUndefined()
      .in(Object.values(ChannelMemberCapability));

    const [channel, targetMember] = await Promise.all(
      [
        this.client.channel.fetch(normalisedChannelId),
        this.client.channel.member.fetch(normalisedChannelId, normalisedChannelId)
      ]
    );

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

    const sourceMemberHasGap = this.client.me?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    if (newCapability === null) {
      if (channel.isOwner) { return true; }

      const targetUser = await this.client.user.fetch(targetMember.id);
      const targetMemberHasGap = targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

      if (hasHigherCapability) { return !targetMemberHasGap; }

      return sourceMemberHasGap || hasHigherCapability;
    }

    if (newCapability === ChannelMemberCapability.OWNER) { return false; }
    if (channel.isOwner) { return true; }

    const targetUser = await this.client.user.fetch(targetMember.id);
    const targetMemberHasGap = targetUser?.privilegeList.includes(UserPrivilege.GROUP_ADMIN) ?? false;

    if (newCapability && [ChannelMemberCapability.SILENCED, ChannelMemberCapability.BANNED].includes(newCapability) && targetMemberHasGap) {
      return false;
    }

    return sourceMemberHasGap || hasHigherCapability;
  }

  async #hasCapability (channelId, userId, capability, checkStaff = true, checkAuthorised = true) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(userId);
    const normalisedCapability = this.normaliseNumber(capability);

    validate(normalisedChannelId, this, this.member.hasCapability)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedUserId, this, this.member.hasCapability)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedCapability, this, this.member.hasCapability)
      .isNotNullOrUndefined()
      .in(Object.values(ChannelMemberCapability));

    if (this.client.config.framework.developerId === normalisedUserId) { return true; }

    if (checkAuthorised && this.client.authorised.isAuthorised(normalisedUserId)) { return true; }

    if (checkStaff && await this.client.utility.user.has(normalisedUserId, UserPrivilege.STAFF)) { return true; }

    const channelMember = await this.client.channel.member.fetch(normalisedChannelId, normalisedUserId);

    if (channelMember === null) { throw new Error(`Member with ID ${normalisedUserId} NOT FOUND in Channel with ID ${normalisedChannelId}`); }

    const hasCapability = (() => {
      switch (normalisedCapability) {
        case ChannelMemberCapability.OWNER:
          return [ChannelMemberCapability.OWNER].includes(channelMember.capability);
        case ChannelMemberCapability.CO_OWNER:
          return [ChannelMemberCapability.OWNER, ChannelMemberCapability.CO_OWNER].includes(channelMember.capability);
        case ChannelMemberCapability.ADMIN:
          return [ChannelMemberCapability.OWNER, ChannelMemberCapability.ADMIN].includes(channelMember.capability);
        case ChannelMemberCapability.MOD:
          return [ChannelMemberCapability.OWNER, ChannelMemberCapability.ADMIN, ChannelMemberCapability.MOD].includes(channelMember.capability);
        default:
          return true;
      }
    })();

    return hasCapability;
  }
}

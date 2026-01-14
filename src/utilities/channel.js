import BaseUtility from './BaseUtility.js';
import ChannelMemberCapability from '../constants/ChannelMemberCapability.js';
import UserPrivilege from '../constants/UserPrivilege.js';

export default class ChannelUtility extends BaseUtility {
  constructor (client) {
    super(client);

    this.member = {
      hasCapability: async (...args) => this.#hasCapability(args[0], args[1], args[2], args[3], args[4])
    };
  }

  async #hasCapability (channelId, userId, capability, checkStaff = true, checkAuthorised = true) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(userId);

    // TODO: validation

    if (this.client.config.framework.developerId === normalisedUserId) { return true; }

    if (checkAuthorised && this.client.authorised.isAuthorised(normalisedUserId)) { return true; }

    if (checkStaff && await this.client.utility.user.has(normalisedUserId, UserPrivilege.STAFF)) { return true; }

    const channelMember = await this.client.channel.member.fetch(normalisedChannelId, normalisedUserId);

    if (channelMember === null) { throw new Error(`Member with ID ${normalisedUserId} NOT FOUND in Channel with ID ${normalisedChannelId}`); }

    const hasCapability = (() => {
      switch (capability) {
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

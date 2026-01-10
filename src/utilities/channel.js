import ChannelMemberCapability from '../constants/ChannelMemberCapability.js';
import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validator/index.js';
import WOLFResponse from '../entities/WOLFResponse.js';

class ChannelUtility {
  constructor (client) {
    this.client = client;

    this.member = {
      hasCapability: async (...args) => this._hasCapability(args[0], args[1], args[2], args[3], args[4])
    };
  }

  async _hasCapability (channelId, userId, capability, checkStaff = true, checkAuthorised = true) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isGreaterThan(0, `ChannelUtility.member.hasCapability() parameter channelId: ${channelId}, must be larger than 0`);

      validate(userId)
        .isGreaterThan(0, `ChannelUtility.member.hasCapability() parameter userId: ${userId}, must be larger than 0`);

      validate(capability)
        .isNotNullOrUndefined(`ChannelUtility.member.hasCapability() parameter, capability: ${capability} is null or undefined`)
        .isValidConstant(ChannelMemberCapability, `ChannelUtility.member.hasCapability() parameter, capability: ${capability} is not valid`);

      validate(checkStaff)
        .isBoolean(`ChannelUtility.member.hasCapability() parameter, checkStaff: ${checkStaff} is not a valid boolean`);

      validate(checkAuthorised)
        .isBoolean(`ChannelUtility.member.hasCapability() parameter, checkAuthorised: ${checkAuthorised} is not a valid boolean`);
    }

    try {
      if (this.client.config.framework.developer === userId) { return true; }

      if (checkAuthorised && this.client.authorised.isAuthorised(userId)) { return true; }

      if (checkStaff && (await this.client.user.getById(userId)).privilegedList.includes(UserPrivilege.STAFF)) { return true; }

      const channelMember = await this.client.channel.member.get(channelId, userId);

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
    } catch (error) {
      if (error instanceof WOLFResponse) {
        if (error.code === StatusCodes.NOT_FOUND) { return false; }
      }

      throw error;
    }
  }
}

export default ChannelUtility;

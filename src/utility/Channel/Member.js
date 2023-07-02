import Base from '../../models/Base.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import { Capability, Privilege } from '../../constants/index.js';

const checkCapability = (capability, subscriberCapability) => {
  switch (capability) {
    case Capability.OWNER:
      return [Capability.OWNER].includes(subscriberCapability);
    case Capability.ADMIN:
      return [Capability.OWNER, Capability.ADMIN].includes(subscriberCapability);
    case Capability.MOD:
      return [Capability.OWNER, Capability.ADMIN, Capability.MOD].includes(subscriberCapability);
    default:
      return true;
  }
};

class Member extends Base {
  async hasCapability (targetGroupId, targetSubscriberId, capability, checkStaff = true, checkAuthorized = true) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be null or undefined', { targetSubscriberId });
    } else if (!validator.isValidNumber(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId must be a valid number', { targetSubscriberId });
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be less than or equal to 0', { targetSubscriberId });
    }

    if (validator.isNullOrUndefined(capability)) {
      throw new WOLFAPIError('capability cannot be null or undefined', { capability });
    } else if (!validator.isValidNumber(capability)) {
      throw new WOLFAPIError('capability must be a valid number', { capability });
    } else if (!Object.values(Capability).includes(capability)) {
      throw new WOLFAPIError('capability is not valid', { capability });
    }

    if (!validator.isValidBoolean(checkStaff)) {
      throw new WOLFAPIError('checkStaff must be a valid boolean', { checkStaff });
    }

    if (!validator.isValidBoolean(checkAuthorized)) {
      throw new WOLFAPIError('checkAuthorized must be a valid boolean', { checkAuthorized });
    }

    // Check if command subscriber is bot developer
    if (this.client.config.framework.developer === targetSubscriberId) {
      return true;
    }

    // Check if command subscriber is authorized
    if (checkAuthorized && await this.client.authorization.isAuthorized(targetSubscriberId)) {
      return true;
    }

    // Check if command subscriber is staff
    if (checkStaff && (Privilege.STAFF && (await this.client.subscriber.getById(targetSubscriberId)).privileges) === Privilege.STAFF) {
      return true;
    }

    const channelMember = await this.client.channel.member.get(targetGroupId, targetSubscriberId);

    if (!channelMember) {
      return false;
    }

    return checkCapability(capability, channelMember.capabilities);
  }
}

export default Member;
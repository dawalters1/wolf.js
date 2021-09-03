const BaseUtility = require('../BaseUtility');
const validator = require('../../utils/validator');

const { capability, privilege, adminAction } = require('@dawalters1/constants');

module.exports = class GroupMember extends BaseUtility {
  constructor (api) {
    super(api, 'groupMember');
  }

  _func () {
    return {
      get: (...args) => this.get(...args),
      admin: (...args) => this._api.group().updateGroupSubscriber(args[0], args[1], adminAction.ADMIN),
      mod: (...args) => this._api.group().updateGroupSubscriber(args[0], args[1], adminAction.MOD),
      reset: (...args) => this._api.group().updateGroupSubscriber(args[0], args[1], adminAction.REGULAR),
      kick: (...args) => this._api.group().updateGroupSubscriber(args[0], args[1], adminAction.KICK),
      ban: (...args) => this._api.group().updateGroupSubscriber(args[0], args[1], adminAction.BAN),

      checkPermissions: (...args) => this.checkPermissions(...args)
    };
  }

  async get (targetGroupId, sourceSubscriberId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

    if (groupSubscriberList.length === 0) {
      return null;
    }

    return groupSubscriberList.find((groupSubscriber) => groupSubscriber.id === sourceSubscriberId);
  }

  async checkPermissions (targetGroupId, sourceSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(requiredCapability)) {
      throw new Error('requiredCapability must be a valid number');
    } else if (!Object.values(capability).includes(requiredCapability)) {
      throw new Error('requiredCapability is not valid');
    }

    if (!validator.isValidBoolean(checkStaff)) {
      throw new Error('checkStaff must be a valid boolean');
    }

    if (checkStaff) {
      const subscriber = await this._api.subscriber().getById(sourceSubscriberId);

      if ((subscriber.privileges & privilege.STAFF) === privilege.STAFF) {
        return true;
      }
    }

    if (includeAuthorizedSubscribers && this._api.authorization().isAuthorized(sourceSubscriberId)) {
      return true;
    }

    const group = await this._api.group().getById(targetGroupId);

    if (requiredCapability === capability.OWNER) {
      return group.owner.id === sourceSubscriberId;
    }

    const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

    if (groupSubscriberList.length === 0) {
      return false;
    }

    const groupSubscriber = groupSubscriberList.find((subscriber) => subscriber.id === sourceSubscriberId);

    if (!groupSubscriber) {
      return false;
    }

    const subscriberCapability = groupSubscriber.capabilities;

    switch (requiredCapability) {
      case capability.ADMIN:
        return subscriberCapability === capability.OWNER || subscriberCapability === capability.ADMIN;
      case capability.MOD:
        return subscriberCapability === capability.OWNER || subscriberCapability === capability.ADMIN || subscriberCapability === capability.MOD;
      default:
        return true;
    }
  }
};

const BaseUtility = require('../BaseUtility');

const { capability, privilege, adminAction } = require('@dawalters1/constants');
const validator = require('@dawalters1/validator');

module.exports = class GroupMember extends BaseUtility {
  constructor (bot) {
    super(bot, 'groupMember');
  }

  _func () {
    return {
      get: (...args) => this.get(...args),
      admin: (...args) => this._bot.group().updateGroupSubscriber(args[0], args[1], adminAction.ADMIN),
      mod: (...args) => this._bot.group().updateGroupSubscriber(args[0], args[1], adminAction.MOD),
      reset: (...args) => this._bot.group().updateGroupSubscriber(args[0], args[1], adminAction.REGULAR),
      kick: (...args) => this._bot.group().updateGroupSubscriber(args[0], args[1], adminAction.KICK),
      ban: (...args) => this._bot.group().updateGroupSubscriber(args[0], args[1], adminAction.BAN),

      checkPermissions: (...args) => this.check(...args)
    };
  }

  async get (groupId, sourceSubscriberId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      const groupSubscriberList = await this._bot.group().getSubscriberList(groupId);

      if (groupSubscriberList.length === 0) {
        return null;
      }

      return groupSubscriberList.find((groupSubscriber) => groupSubscriber.id === sourceSubscriberId);
    } catch (error) {
      error.method = `Utility/utilties/groupMember/get(groupId = ${JSON.stringify(groupId)}, sourceSubscriberId = ${JSON.stringify(sourceSubscriberId)})`;
      throw error;
    }
  }

  async checkPermissions (groupId, sourceSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    try {
      // #region validation
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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
        const subscriber = await this._bot.subscriber().getById(sourceSubscriberId);

        if ((subscriber.privileges & privilege.STAFF) === privilege.STAFF) {
          return true;
        }
      }

      if (includeAuthorizedSubscribers && this._bot.authorization().isAuthorized(sourceSubscriberId)) {
        return true;
      }

      const group = await this._bot.group().getById(groupId);

      if (requiredCapability === capability.OWNER) {
        return group.owner.id === sourceSubscriberId;
      }

      const groupSubscriberList = await this._bot.group().getSubscriberList(groupId);

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

    // #endregion
    } catch (error) {
      error.method = `Utility/utilties/groupMember/checkPermissions(groupId = ${JSON.stringify(groupId)}, sourceSubscriberId = ${JSON.stringify(sourceSubscriberId)}, requiredCapability = ${JSON.stringify(requiredCapability)}, checkStaff = ${JSON.stringify(checkStaff)}, includeAuthorizedSubscribers = ${JSON.stringify(includeAuthorizedSubscribers)})`;
      throw error;
    }
  }
};

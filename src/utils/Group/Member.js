const validator = require('../../validator');

const { Capability, Privilege } = require('../../constants');

const checkCapability = (requiredCapability, subscriberCapability) => {
  switch (requiredCapability) {
    case Capability.ADMIN:
      return subscriberCapability === Capability.OWNER || subscriberCapability === Capability.ADMIN;
    case Capability.MOD:
      return subscriberCapability === Capability.OWNER || subscriberCapability === Capability.ADMIN || subscriberCapability === Capability.MOD;
    default:
      return true;
  }
};

class Member {
  constructor (api) {
    this._api = api;
  }

  async get (targetGroupId, targetSubscriberId) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

      if (groupSubscriberList.length === 0) {
        return null;
      }

      return groupSubscriberList.find((groupSubscriber) => groupSubscriber.id === targetSubscriberId);
    } catch (error) {
      error.internalErrorMessage = `api.utility().group().member().get(targetGroupId=${JSON.stringify(targetGroupId)}, targetSubscriberId=${JSON.stringify(targetSubscriberId)})`;
      throw error;
    }
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.utility().group().member().hasCapabilities(targetGroupId, targetSubscriberId, requiredCapability)
   */
  async checkPermissions (targetGroupId, targetSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    return this.hasCapability(targetGroupId, targetSubscriberId, requiredCapability, checkStaff, includeAuthorizedSubscribers);
  }

  async hasCapability (targetGroupId, targetSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(Capability)) {
        throw new Error('Capability cannot be null or undefined');
      } else if (!validator.isValidNumber(Capability)) {
        throw new Error('Capability must be a valid number');
      } else if (!Object.values(Capability).includes(requiredCapability)) {
        throw new Error('requiredCapability is not valid');
      }
      if (!validator.isValidBoolean(checkStaff)) {
        throw new Error('checkStaff must be a valid boolean');
      }

      if (this._api.options.developerId === targetSubscriberId) {
        return true;
      }

      if (this._api.currentSubscriber.id === targetSubscriberId) {
        const group = await this._api.group().getById(targetGroupId);

        if (group.owner.id === targetSubscriberId) {
          return true;
        }

        if (group.inGroup && group.capabilities) {
          return checkCapability(requiredCapability, group.capabilities);
        }
      }

      if (checkStaff) {
        const subscriber = await this._api.subscriber().getById(targetSubscriberId);

        if ((subscriber.privileges & Privilege.STAFF) === Privilege.STAFF) {
          return true;
        }
      }

      if (includeAuthorizedSubscribers && this._api.authorization().isAuthorized(targetSubscriberId)) {
        return true;
      }

      const group = await this._api.group().getById(targetGroupId);

      if (group.owner.id === targetSubscriberId) {
        return true;
      }

      const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

      if (groupSubscriberList.length === 0) {
        return false;
      }

      const groupSubscriber = groupSubscriberList.find((subscriber) => subscriber.id === targetSubscriberId);

      if (!groupSubscriber) {
        return false;
      }

      return checkCapability(requiredCapability, groupSubscriber.capabilities);
    } catch (error) {
      error.internalErrorMessage = `api.utility().group().member().hasCapability(targetGroupId=${JSON.stringify(targetGroupId)}, targetSubscriberId=${JSON.stringify(targetSubscriberId)}, Capability=${JSON.stringify(Capability)}, checkStaff=${JSON.stringify(checkStaff)}, includeAuthorizedSubscribers=${JSON.stringify(includeAuthorizedSubscribers)})`;
      throw error;
    }
  }
}

module.exports = Member;

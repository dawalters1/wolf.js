const validator = require('../../validator');

const { capability, privilege } = require('../../constants');

const checkCapability = (requiredCapability, subscriberCapability) => {
  switch (requiredCapability) {
    case capability.ADMIN:
      return subscriberCapability === capability.OWNER || subscriberCapability === capability.ADMIN;
    case capability.MOD:
      return subscriberCapability === capability.OWNER || subscriberCapability === capability.ADMIN || subscriberCapability === capability.MOD;
    default:
      return true;
  }
};

class Member {
  constructor (api) {
    this._api = api;
  }

  async get (targetGroupId, sourceSubscriberId) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }

      const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

      if (groupSubscriberList.length === 0) {
        return null;
      }

      return groupSubscriberList.find((groupSubscriber) => groupSubscriber.id === sourceSubscriberId);
    } catch (error) {
      error.internalErrorMessage = `api.utility().group().member().get(targetGroupId=${JSON.stringify(targetGroupId)}, sourceSubscriberId=${JSON.stringify(sourceSubscriberId)})`;
      throw error;
    }
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.utility().group().member().hasCapabilities(targetGroupId, sourceSubscriberId, requiredCapability)
   */
  async checkPermissions (targetGroupId, sourceSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    return this.hasCapability(targetGroupId, sourceSubscriberId, requiredCapability, checkStaff, includeAuthorizedSubscribers);
  }

  async hasCapability (targetGroupId, sourceSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(capability)) {
        throw new Error('capability cannot be null or undefined');
      } else if (!validator.isValidNumber(capability)) {
        throw new Error('capability must be a valid number');
      } else if (!Object.values(capability).includes(requiredCapability)) {
        throw new Error('requiredCapability is not valid');
      }
      if (!validator.isValidBoolean(checkStaff)) {
        throw new Error('checkStaff must be a valid boolean');
      }

      if (this._api.options.developerId === sourceSubscriberId) {
        return true;
      }

      if (this._api.currentSubscriber.id === sourceSubscriberId) {
        const group = await this._api.group().getById(targetGroupId);

        if (group.owner.id === sourceSubscriberId) {
          return true;
        }

        if (group.inGroup && group.capabilities) {
          return checkCapability(requiredCapability, group.capabilities);
        }
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

      if (group.owner.id === sourceSubscriberId) {
        return true;
      }

      const groupSubscriberList = await this._api.group().getSubscriberList(targetGroupId);

      if (groupSubscriberList.length === 0) {
        return false;
      }

      const groupSubscriber = groupSubscriberList.find((subscriber) => subscriber.id === sourceSubscriberId);

      if (!groupSubscriber) {
        return false;
      }

      return checkCapability(requiredCapability, groupSubscriber.capabilities);
    } catch (error) {
      error.internalErrorMessage = `api.utility().group().member().hasCapability(targetGroupId=${JSON.stringify(targetGroupId)}, sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, capability=${JSON.stringify(capability)}, checkStaff=${JSON.stringify(checkStaff)}, includeAuthorizedSubscribers=${JSON.stringify(includeAuthorizedSubscribers)})`;
      throw error;
    }
  }
}

module.exports = Member;

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
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (!validator.isType(targetSubscriberId, 'number')) {
        throw new Error('targetSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      const group = await this._api._group.getById(targetGroupId);

      if (group.subscribers && group.subscribers.length > 0) {
        const subscriber = group.subscribers.find((groupSubscriber) => groupSubscriber.id === targetSubscriberId);

        if (subscriber) {
          return subscriber;
        }

        if (group._requestedMembersList) {
          return null;
        }
      }

      return await this._api._group.getSubscriber(targetGroupId, targetSubscriberId);
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.group${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.member${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.get(targetGroupId=${JSON.stringify(targetGroupId)}, targetSubscriberId=${JSON.stringify(targetSubscriberId)})`;
      throw error;
    }
  }

  async hasCapability (targetGroupId, targetSubscriberId, requiredCapability, checkStaff = true, includeAuthorizedSubscribers = true) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (!validator.isType(targetSubscriberId, 'number')) {
        throw new Error('targetSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(requiredCapability)) {
        throw new Error('requiredCapability cannot be null or undefined');
      } else if (!validator.isValidNumber(requiredCapability)) {
        throw new Error('requiredCapability must be a valid number');
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
        const group = await this._api._group.getById(targetGroupId);

        if (group.owner.id === targetSubscriberId) {
          return true;
        }

        if (group.inGroup && group.capabilities) {
          return checkCapability(requiredCapability, group.capabilities);
        }
      }

      if (checkStaff) {
        const subscriber = await this._api._subscriber.getById(targetSubscriberId);

        if ((subscriber.privileges & Privilege.STAFF) === Privilege.STAFF) {
          return true;
        }
      }

      if (includeAuthorizedSubscribers && await this._api._authorization.isAuthorized(targetSubscriberId)) {
        return true;
      }

      const group = await this._api._group.getById(targetGroupId);

      if (group.owner.id === targetSubscriberId) {
        return true;
      }

      const groupSubscriber = await this.get(targetGroupId, targetSubscriberId);

      if (!groupSubscriber) {
        return false;
      }

      return checkCapability(requiredCapability, groupSubscriber.capabilities);
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.group${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.member${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.hasCapability(targetGroupId=${JSON.stringify(targetGroupId)}, targetSubscriberId=${JSON.stringify(targetSubscriberId)}, requiredCapability=${JSON.stringify(requiredCapability)}, checkStaff=${JSON.stringify(checkStaff)}, includeAuthorizedSubscribers=${JSON.stringify(includeAuthorizedSubscribers)})`;
      throw error;
    }
  }
}

module.exports = Member;

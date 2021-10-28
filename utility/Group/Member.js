const validator = require('../../validator');

const { capability, privilege } = require('@dawalters1/constants');

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

  /**
   * Get a subscriber from the groups member list
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} sourceSubscriberId - The id of the subscriber
   * @returns {Object} The subscriber if they are in the group
   */
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

  /**
   * Check to see if a group member has the minimum required capability
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} sourceSubscriberId - The id of the subscriber
   * @param {Number} requiredCapability - The minimum required capability
   * @param {Boolean} checkStaff - Whether or not to check if the subscriber is staff
   * @param {Boolean} includeAuthorizedSubscribers - Whether or not to check whether or not a subscriber is authorized
   * @returns {Boolean}
   */
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
  }
}

module.exports = Member;

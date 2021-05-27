const BaseUtility = require('../BaseUtility');

const { capability, privilege } = require('../../constants');
const validator = require('../../utils/validator');

module.exports = class GroupMemberCapability extends BaseUtility {
  constructor (bot) {
    super(bot, 'groupMemberCapability');
  }

  _function () {
    return {
      checkPermissions: (...args) => this.check(...args)
    };
  }

  async check (groupId, sourceSubscriberId, requiredCapability, checkStaff = true) {
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

    const group = await this._bot.group().getById(groupId);

    console.log(requiredCapability);

    if (requiredCapability === capability.OWNER) {
      return group.owner.id === sourceSubscriberId;
    }

    group.inGroup = true;

    await this._bot.group()._process(group);

    const groupSubscriberList = await this._bot.group().getSubscriberList(groupId);

    console.log(groupSubscriberList);

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

const Helper = require('../Helper');
const validator = require('../../validator');

/**
 * {@hideconstructor}
 */
module.exports = class Banned extends Helper {
  constructor (api) {
    super(api);

    this._banned = [];
  }

  /**
  * List of subscribers banned from using the bot
  */
  list () {
    return this._banned;
  }

  /**
   * Check to see if a subscriber is banned from the bot
   * @param {Number} subscriberId - The id of the subscriber
   */
  isBanned (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return this._banned.includes(subscriberId);
  }

  /**
   * Clear the banned subscriber list
   */
  clear () {
    this._banned = [];
  }

  /**
   * Ban a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers
   */
  ban (subscriberIds) {
    subscriberIds = Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds];

    if (subscriberIds.length === 0) {
      throw new Error('subscriberIds cannot be an empty array');
    }
    for (const subscriberId of subscriberIds) {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }
    }
    this._banned.push(...subscriberIds);
  }

  /**
   * Unban a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers
   */
  unban (subscriberIds) {
    subscriberIds = Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds];

    if (subscriberIds.length === 0) {
      throw new Error('subscriberIds cannot be an empty array');
    }

    for (const subscriberId of subscriberIds) {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }
    }

    this._banned = this._banned.filter((banned) => !subscriberIds.includes(banned));
  }
};

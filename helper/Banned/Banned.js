const Helper = require('../Helper');

const validator = require('@dawalters1/validator');
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
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return this._banned.includes(subscriberId);
    } catch (error) {
      error.method = `Helper/Banned/isBanned(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
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
    try {
      if (validator.isValidArray(subscriberIds)) {
        for (const subscriberId of subscriberIds) {
          if (!validator.isValidNumber(subscriberId)) {
            throw new Error('subscriberId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(subscriberId)) {
            throw new Error('subscriberId cannot be less than or equal to 0');
          }
        }
      } else {
        if (!validator.isValidNumber(subscriberIds)) {
          throw new Error('subscriberIds must be a valid number');
        } else if (validator.isLessThanOrEqualZero(subscriberIds)) {
          throw new Error('subscriberIds cannot be less than or equal to 0');
        }
      }

      this._banned.push(...(validator.isValidArray(subscriberIds) ? subscriberIds : [subscriberIds]));
    } catch (error) {
      error.method = `Helper/Banned/ban(subscriberIds = ${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  /**
   * Unban a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers
   */
  unban (subscriberIds) {
    try {
      if (validator.isValidArray(subscriberIds)) {
        for (const subscriberId of subscriberIds) {
          if (!validator.isValidNumber(subscriberId)) {
            throw new Error('subscriberId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(subscriberId)) {
            throw new Error('subscriberId cannot be less than or equal to 0');
          }
        }
      } else {
        if (!validator.isValidNumber(subscriberIds)) {
          throw new Error('subscriberIds must be a valid number');
        } else if (validator.isLessThanOrEqualZero(subscriberIds)) {
          throw new Error('subscriberIds cannot be less than or equal to 0');
        }
      }

      this._banned = this._banned.filter((banned) => validator.isValidArray(subscriberIds) ? subscriberIds.includes(banned) : banned === subscriberIds);
    } catch (error) {
      error.method = `Helper/Banned/unban(subscriberId = ${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }
};

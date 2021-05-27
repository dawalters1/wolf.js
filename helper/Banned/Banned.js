const Helper = require('../Helper');

const validator = require('../../utils/validator');

module.exports = class Banned extends Helper {
  constructor (bot) {
    super(bot);

    this._cache = [];
  }

  list () {
    return this._cache;
  }

  isBanned (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return this._cache.includes(subscriberId);
  }

  clear () {
    this._cache = [];
  }

  ban (subscriberIds) {
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

    this._cache.push(...(validator.isValidArray(subscriberIds) ? subscriberIds : [subscriberIds]));
  }

  unban (subscriberIds) {
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

    this._cache = this._cache.filter((banned) => validator.isValidArray(subscriberIds) ? subscriberIds.includes(banned) : banned === subscriberIds);
  }
};

const Helper = require('../Helper');

const validator = require('@dawalters1/validator');

module.exports = class Authorized extends Helper {
  constructor (bot) {
    super(bot);

    this._authorized = [];
  }

  /**
   * List of all authorized subscriber id
   */
  list () {
    return this._authorized;
  }

  /**
   * Check to see if a subscriber is authorized
   * @param {Number} subscriberId - The id of the subscriber
   */
  isAuthorized (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return this.list().includes(subscriberId);
    } catch (error) {
      error.method = `Helper/Authroization/isAuthorized(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  /**
   * Clear the authorized subscriber list
   */
  clear () {
    this._authorized = [];
  }

  /**
   * Authorize a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers to authorize
   */
  authorize (subscriberIds) {
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

      this._authorized.push(...(validator.isValidArray(subscriberIds) ? subscriberIds : [subscriberIds]));
    } catch (error) {
      error.method = `Helper/Authroization/authorize(subscriberIds = ${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  /**
   * Unauthorize a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers to Unauthorize
   */
  unauthorize (subscriberIds) {
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

      this._authorized = this._authorized.filter((authorized) => validator.isValidArray(subscriberIds) ? subscriberIds.includes(authorized) : authorized === subscriberIds);
    } catch (error) {
      error.method = `Helper/Authroization/unauthorize(subscriberIds = ${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }
};

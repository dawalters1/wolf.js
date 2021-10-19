const Helper = require('../Helper');
const validator = require('../../validator');

/**
 * {@hideconstructor}
 */
module.exports = class Authorized extends Helper {
  constructor (api) {
    super(api);

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
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return this.list().includes(subscriberId);
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

    this._authorized.push(...subscriberIds);
  }

  /**
   * Unauthorize a subscriber or subscribers
   * @param {[Number]} subscriberIds - The id/ids of the subscribers to Unauthorize
   */
  unauthorize (subscriberIds) {
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

    this._authorized = this._authorized.filter((authorized) => !subscriberIds.includes(authorized));
  }
};

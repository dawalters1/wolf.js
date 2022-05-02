const Base = require('../Base');
const validator = require('../../validator');

const validateData = (targetSubscriberId) => {
  const targetSubscriberIds = Array.isArray(targetSubscriberId) ? targetSubscriberId : [targetSubscriberId];

  if (!targetSubscriberIds.length) {
    throw new Error('targetSubscriberIds cannot be null or empty');
  }

  if ([...new Set(targetSubscriberIds)].length !== targetSubscriberIds.length) {
    throw new Error('targetSubscriberIds cannot contain duplicates');
  }

  for (const subscriberId of targetSubscriberIds) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new Error('subscriberId cannot be null or undefined');
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }
  }

  return targetSubscriberIds.map((targetSubscriberId) => parseInt(targetSubscriberId));
};

class Authorization extends Base {
  constructor (client) {
    super(client);

    this._authorization = [];
  }

  /**
   * Retrieve the list of authorized users for the bot
   * @returns {Promise<Array.<Number>>}
   */
  async list () {
    return this._authorization;
  }

  /**
   * Check to see if a single user or multiple users are authorized by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async isAuthorized (targetSubscriberId) {
    const results = validateData(targetSubscriberId).reduce((result, subscriberId) => {
      result.push(this._authorization.includes(parseInt(subscriberId)));
      return result;
    }, []);

    return Array.isArray(targetSubscriberId) ? results : results[0];
  }

  /**
   * Authorize a single user or multiple users by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async authorize (targetSubscriberId) {
    const results = validateData(targetSubscriberId).reduce((result, subscriberId) => {
      if (this._authorization.includes(parseInt(subscriberId))) {
        result.push(false);
      } else {
        this._authorization.push(parseInt(subscriberId));
        result.push(true);
      }
      return result;
    }, []);

    return Array.isArray(targetSubscriberId) ? results : results[0];
  }

  /**
   * Unauthorize a single user or multiple users by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async unauthorize (targetSubscriberId) {
    const results = validateData(targetSubscriberId).reduce((result, subscriberId) => {
      if (!this._authorization.includes(parseInt(subscriberId))) {
        result.push(false);
      } else {
        this._authorized.splice(this._authorized.indexOf(subscriberId), 1);
        result.push(true);
      }
      return result;
    }, []);

    return Array.isArray(targetSubscriberId) ? results : results[0];
  }
}

module.exports = Authorization;

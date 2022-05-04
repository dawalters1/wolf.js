const Base = require('../Base');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class Banned extends Base {
  constructor (client) {
    super(client);

    this._banned = [];
  }

  /**
   * Retrieve the list of banned users for the bot
   * @returns {Promise<Array.<Number>>}
   */
  async list () {
    return this._banned;
  }

  /**
   * Check to see if a single user or multiple users are banned by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async isBanned (targetSubscriberIds) {
    targetSubscriberIds = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id); ;

    if (!targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot be null or empty', targetSubscriberIds);
    }

    if ([...new Set(targetSubscriberIds)].length !== targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot contain duplicates', targetSubscriberIds);
    }

    for (const subscriberId of targetSubscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
      }
    }

    const results = targetSubscriberIds.reduce((result, subscriberId) => {
      result.push(this._banned.includes(subscriberId));
      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Ban a single user or multiple users by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async ban (targetSubscriberIds) {
    targetSubscriberIds = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id); ;

    if (!targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot be null or empty', targetSubscriberIds);
    }

    if ([...new Set(targetSubscriberIds)].length !== targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot contain duplicates', targetSubscriberIds);
    }

    for (const subscriberId of targetSubscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
      }
    }

    const results = targetSubscriberIds.reduce((result, subscriberId) => {
      if (this._banned.includes(subscriberId)) {
        result.push(false);
      } else {
        this._banned.push(subscriberId);
        result.push(true);
      }
      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Unban a single user or multiple users by ID
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async unban (targetSubscriberIds) {
    targetSubscriberIds = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id); ;

    if (!targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot be null or empty', targetSubscriberIds);
    }

    if ([...new Set(targetSubscriberIds)].length !== targetSubscriberIds.length) {
      throw new WOLFAPIError('targetSubscriberIds cannot contain duplicates', targetSubscriberIds);
    }

    for (const subscriberId of targetSubscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
      }
    }

    const results = targetSubscriberIds.reduce((result, subscriberId) => {
      if (!this._banned.includes(subscriberId)) {
        result.push(false);
      } else {
        this._authorized.splice(this._authorized.indexOf(subscriberId), 1);
        result.push(true);
      }
      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }
}

module.exports = Banned;

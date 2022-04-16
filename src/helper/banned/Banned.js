const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');

class Banned extends BaseHelper {
  constructor (api) {
    super(api);

    this._banned = [];
  }

  async list () {
    return this._banned;
  }

  async clear () {
    this._banned = [];
  }

  async isBanned (subscriberIds) {
    try {
      subscriberIds = Array.isArray(subscriberIds) ? [...new Set(subscriberIds)] : [subscriberIds];

      if (subscriberIds.length === 0) {
        throw new Error('subscriberIds cannot be an empty array');
      }
      for (const subscriberId of subscriberIds) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new Error('subscriberId cannot be null or undefined');
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.map((subscriberId) => this._banned.includes(subscriberId));

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.banned${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.isBanned(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async ban (subscriberIds) {
    try {
      subscriberIds = Array.isArray(subscriberIds) ? [...new Set(subscriberIds)] : [subscriberIds];

      if (subscriberIds.length === 0) {
        throw new Error('subscriberIds cannot be an empty array');
      }
      for (const subscriberId of subscriberIds) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new Error('subscriberId cannot be null or undefined');
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.reduce((result, value) => {
        if (!this._banned.includes(value)) {
          this._banned.push(value);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.banned${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.ban(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async unban (subscriberIds) {
    try {
      subscriberIds = Array.isArray(subscriberIds) ? [...new Set(subscriberIds)] : [subscriberIds];

      if (subscriberIds.length === 0) {
        throw new Error('subscriberIds cannot be an empty array');
      }
      for (const subscriberId of subscriberIds) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new Error('subscriberId cannot be null or undefined');
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.reduce((result, value) => {
        if (this._banned.includes(value)) {
          this._banned.splice(this._banned.indexOf(value), 1);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.banned${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.unban(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }
}

module.exports = Banned;

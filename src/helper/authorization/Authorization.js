const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');

class Authorization extends BaseHelper {
  constructor (api) {
    super(api);

    this._authorized = [];
  }

  async list () {
    return this._authorized;
  }

  async clear () {
    this._authorized = [];
  }

  async isAuthorized (subscriberIds) {
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
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.map((subscriberId) => this._authorized.includes(subscriberId));

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.authorization().isAuthorize(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async authorize (subscriberIds) {
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
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.reduce((result, value) => {
        if (!this._authorized.includes(value)) {
          this._authorized.push(value);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.authorization().authorize(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async unauthorize (subscriberIds) {
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
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const results = subscriberIds.reduce((result, value) => {
        if (this._authorized.includes(value)) {
          this._authorized.splice(this._authorized.indexOf(value), 1);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.authorization().unauthorize(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }
}

module.exports = Authorization;

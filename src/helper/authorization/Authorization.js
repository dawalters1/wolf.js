const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');

const AUTHORIZATION_LIST_PREFIX = 'authorization.list';

class Authorization extends BaseHelper {
  constructor (api) {
    super(api, true);
  }

  async list () {
    return this._cache.getItem(AUTHORIZATION_LIST_PREFIX) || [];
  }

  async clear () {
    return this._cache.delItem(AUTHORIZATION_LIST_PREFIX);
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
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const authorizationList = await this._cache.getItem(AUTHORIZATION_LIST_PREFIX) || [];

      const results = subscriberIds.map((subscriberId) => authorizationList.includes(subscriberId));

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
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const authorizationList = await this._cache.getItem(AUTHORIZATION_LIST_PREFIX) || [];

      const results = subscriberIds.reduce((result, value) => {
        if (!authorizationList.includes(value)) {
          authorizationList.push(value);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      await this._cache.setItem(AUTHORIZATION_LIST_PREFIX, authorizationList);

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
        } else if (!validator.isType(subscriberId, 'number')) {
          throw new Error('subscriberId must be type of number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      const authorizationList = await this._cache.getItem(AUTHORIZATION_LIST_PREFIX) || [];

      const results = subscriberIds.reduce((result, value) => {
        if (authorizationList.includes(value)) {
          authorizationList.splice(authorizationList.indexOf(value), 1);
          result.push(true);
        } else {
          result.push(false);
        }

        return result;
      }, []);

      await this._cache.setItem(AUTHORIZATION_LIST_PREFIX, authorizationList);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.authorization().unauthorize(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }
}

module.exports = Authorization;

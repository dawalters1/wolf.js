const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');
const { Commands } = require('../../constants');

class Blocked extends BaseHelper {
  constructor (api) {
    super(api);

    this._blocked = [];
  }

  async list (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._blocked.length > 0) {
        return this._blocked;
      }

      const result = await this._websocket.emit(Commands.SUBSCRIBER_BLOCK_LIST,
        {
          subscribe: true
        }
      );

      if (result.success) {
        this._blocked = result.body;
      }

      return this._blocked;
    } catch (error) {
      error.internalErrorMessage = `api.blocked().list(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async isBlocked (subscriberIds) {
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

      const results = subscriberIds.map((subscriberId) => this._blocked.some((subscriber) => subscriber.id === subscriberId));

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.blocked().isBlocked(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async block (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.SUBSCRIBER_BLOCK_ADD,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.blocked().block(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async unblock (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.SUBSCRIBER_BLOCK_DELETE,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.blocked().unblock(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async _cleanup (disconnected) {
    if (!disconnected && this._blocked.length > 0) {
      return await this.list(true); // resubscribe if subscribed before reconnect
    }

    this._blocked = [];
  }
}

module.exports = Blocked;

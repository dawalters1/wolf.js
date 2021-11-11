const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');
const { commands } = require('../../constants');

class Contact extends BaseHelper {
  constructor (api) {
    super(api);

    this._contacts = [];
  }

  async list (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._contacts.length > 0) {
        return this._contacts;
      }

      const result = await this._websocket.emit(commands.SUBSCRIBER_CONTACT_LIST);

      if (result.success) {
        this._contacts = result.body;
      }

      return this._contacts;
    } catch (error) {
      error.internalErrorMessage = `api.contact().list(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async isContact (subscriberIds) {
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

      const results = subscriberIds.map((subscriberId) => this._contacts.some((subscriber) => subscriber.id === subscriberId));

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      error.internalErrorMessage = `api.contact().isContact(subscriberIds=${JSON.stringify(subscriberIds)})`;
      throw error;
    }
  }

  async add (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        commands.SUBSCRIBER_CONTACT_ADD,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.contact().add(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use {@link remove}
   */
  async delete (subscriberId) {
    return await this.remove(subscriberId);
  }

  async remove (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        commands.SUBSCRIBER_CONTACT_DELETE,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.contact().delete(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  _cleanup () {
    this._contacts = [];
  }
}

module.exports = Contact;

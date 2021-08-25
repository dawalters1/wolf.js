const Helper = require('../Helper');

const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

module.exports = class Contact extends Helper {
  constructor (api) {
    super(api);

    this._contacts = [];
  }

  /**
   *
   * List of contacts for the bot
   */
  async list () {
    if (this._contacts.length > 0) {
      return this._contacts;
    }

    const result = await this._websocket.emit(request.SUBSCRIBER_CONTACT_LIST,
      {
        subscribe: true
      });

    if (result.success) {
      this._contacts = result.body;
    }

    return this._contacts || [];
  }

  /**
   * Check to see if a subscriber is a contact
   * @param {Number} subscriberId - The id of the subscriber
   */
  async isContact (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return (await this.list()).find((contact) => contact.id === subscriberId) !== null;
  }

  /**
   * Add a subscriber as a contact
   * @param {Number} subscriberId - The id of the subscriber
   */
  async add (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_CONTACT_ADD, {
      id: subscriberId
    });
  }

  /**
   * Delete a subscriber as a contact
   * @param {Number} subscriberId - The id of the subscriber
   */
  async delete (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_CONTACT_DELETE, {
      id: subscriberId
    });
  }

  async _process (id) {
    const existing = this._contacts.find((contact) => contact.id === id);

    if (existing) {
      this._contacts = this._contacts.filter((contact) => contact.id !== id);

      return existing;
    } else {
      const subscriber = await this._api.subscriber().getById(id);

      const contact = {
        id,
        additionalInfo: {
          hash: subscriber.hash,
          nickname: subscriber.nickname,
          onlineState: subscriber.onlineState,
          privileges: subscriber.privileges
        }
      };

      this._contacts.push(contact);

      return contact;
    }
  }

  async _patch (subscriber) {
    const existing = this._contacts.find((contact) => contact.id === subscriber.id);

    if (existing) {
      for (const key in subscriber) {
        existing[key] = subscriber[key];
      }
    }

    return existing;
  }

  _cleanUp () {
    this._contacts = [];
  }
};

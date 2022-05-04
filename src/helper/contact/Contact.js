const { Command } = require('../../constants');
const Base = require('../Base');
const Blocked = require('./Blocked');

const models = require('../../models');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class Contact extends Base {
  constructor (client) {
    super(client);

    this.blocked = new Blocked(client);

    this._contacts = [];
  }

  async list () {
    if (this._contacts.length) {
      return this._contacts;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        subscribe: true
      }
    );

    if (response.success) {
      this._contacts = response.body.map((contact) => new models.Contact(this.client, contact));
    }

    return this._contacts;
  }

  async isContact (subscriberIds) {
    subscriberIds = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!subscriberIds.length) {
      throw new WOLFAPIError('subscriberIds cannot be null or empty', subscriberIds);
    }

    if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
      throw new WOLFAPIError('subscriberIds cannot contain duplicates', subscriberIds);
    }

    for (const subscriberId of subscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
      }
    }

    await this.list();

    const results = subscriberIds.reduce((result, subscriberId) => {
      result.push(this._contacts.find((contact) => contact.id === subscriberId));

      return result;
    }, []);

    return Array.isArray(subscriberIds) ? results : results[0];
  }

  async add (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_ADD,
      {
        id: parseInt(subscriberId)
      }
    );
  }

  async delete (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', subscriberId);
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', subscriberId);
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', subscriberId);
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        id: parseInt(subscriberId)
      }
    );
  }
}

module.exports = Contact;

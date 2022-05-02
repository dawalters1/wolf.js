const { Commands } = require('../../constants');
const Base = require('../Base');
const Blocked = require('./Blocked');

const models = require('../../models');

const validator = require('../../validator');

/**
 * TODO: Paramater validation
 */
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
      Commands.SUBSCRIBER_CONTACT_LIST,
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
      throw new Error('subscriberIds cannot be null or empty');
    }

    if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
      throw new Error('subscriberIds cannot contain duplicates');
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

    await this.list();

    const results = subscriberIds.reduce((result, subscriberId) => {
      result.push(this._contacts.find((contact) => contact.id === subscriberId));

      return result;
    }, []);

    return Array.isArray(subscriberIds) ? results : results[0];
  }

  async add (subscriberId) {
    return await this.client.websocket.emit(
      Commands.SUBSCRIBER_CONTACT_ADD,
      {
        id: subscriberId
      }
    );
  }

  async delete (subscriberId) {
    return await this.client.websocket.emit(
      Commands.SUBSCRIBER_CONTACT_DELETE,
      {
        id: subscriberId
      }
    );
  }
}

module.exports = Contact;

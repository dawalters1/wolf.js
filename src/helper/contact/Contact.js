import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Blocked from './Blocked.js';

class Contact extends Base {
  constructor (client) {
    super(client);
    this.blocked = new Blocked(client);
    this.contacts = [];
  }

  /**
   * Get the Bots contacts list
   * @param {Boolean} subscribe
   * @returns {Promise<Array<Contact>>}
   */
  async list (subscribe = true) {
    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (this.contacts.length) {
      return this.contacts;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        subscribe
      }
    );

    this.contacts = response.body?.map((contact) => new models.Contact(this.client, contact)) ?? [];

    return this.contacts;
  }

  /**
   * Check whether or not a subscriber is a contact
   * @param {number | Array<number>} subscriberIds
   * @returns {Promise<boolean | Array<boolean>>}
   */
  async isContact (subscriberIds) {
    const values = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!values.length) {
      throw new models.WOLFAPIError('subscriberIds cannot be null or empty', { subscriberIds });
    }

    if ([...new Set(values)].length !== values.length) {
      throw new models.WOLFAPIError('subscriberIds cannot contain duplicates', { subscriberIds });
    }

    for (const subscriberId of values) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    const contactIds = (await this.list())
      .map((contact) => contact.id);

    const results = values.map((subscriberId) => contactIds.includes(subscriberId));

    return Array.isArray(subscriberIds) ? results : results[0];
  }

  /**
   * Add a subscriber as a contact
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async add (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_ADD,
      {
        id: parseInt(subscriberId)
      }
    );
  }

  /**
   * Remove a subscriber as a contact
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async delete (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        id: parseInt(subscriberId)
      }
    );
  }

  _cleanUp (reconnection = false) {
    this.contacts = [];
  }
}

export default Contact;

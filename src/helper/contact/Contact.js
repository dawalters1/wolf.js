'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import ContactCache from '../../cache/ContactCache.js';
// Variables
import { Command } from '../../constants/index.js';

class Contact extends Base {
  constructor (client) {
    super(client);

    this.contactCache = ContactCache();
    this.blocked = new Contact(client);
  }

  async list (forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Contact.list() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew && this.contactCache.fetched) {
      return this.contactCache.list();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        subscribe: true
      }
    );

    this.contactCache.fetched = true;

    return this.contactCache.set(response.body.map((blockedUser) => new structures.Contact(this.client, blockedUser)));
  }

  async add (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValuserIdNumber(userId)) {
        throw new Error(`Contact.add() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Contact.add() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_ADD,
      {
        userId
      }
    );
  }

  async delete (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValuserIdNumber(userId)) {
        throw new Error(`Contact.delete() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Contact.delete() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        userId
      }
    );
  }
}

export default Contact;

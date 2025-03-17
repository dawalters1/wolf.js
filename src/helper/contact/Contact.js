'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import DataManager from '../../managers/DataManager.js';
// Variables
import { Command } from '../../constants/index.js';

class Contact extends Base {
  constructor (client) {
    super(client);

    this._contacts = DataManager();
    this.blocked = new Contact(client);
  }

  async list () {
    if (this._contacts._fetched) {
      return this._contacts.cache.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this._contacts._fetched = true;

    return response.body.map((contact) =>
      this._contacts._add(new structures.Contact(this.client, contact))
    );
  }

  async add (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Contact.add() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Contact.add() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_ADD,
      {
        body: {
          id: userId
        }
      }
    );
  }

  async delete (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`Contact.delete() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Contact.delete() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        body: {
          id: userId
        }
      }
    );
  }
}

export default Contact;

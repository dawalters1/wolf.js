import BaseHelper from '../baseHelper.js';
import BlockedHelper from './blocked.js';
import { Command } from '../../constants/Command.js';
import Contact from '../../entities/contact.js';
import { validate } from '../../validator/index.js';

class ContactHelper extends BaseHelper {
  constructor (client) {
    super(client);
    this.blocked = new BlockedHelper(client);
  }

  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'ContactHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this.cache.fetched = true;

    return response.body.map(serverContact => {
      const existing = this.cache.get(serverContact.id);

      return this.cache.set(
        existing?.patch(serverContact) ?? new Contact(this.client, serverContact),
        response.headers?.maxAge
      );
    });
  }

  async isContact (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`ContactHelper.isContact() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ContactHelper.isContact() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ContactHelper.isContact() parameter, userId: ${userId} is less than or equal to zero`);
    }
    await this.list();
    return this.cache.has(userId);
  }

  async add (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`ContactHelper.add() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ContactHelper.add() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ContactHelper.add() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.client.websocket.emit(
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
      validate(userId)
        .isNotNullOrUndefined(`ContactHelper.delete() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`ContactHelper.delete() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `ContactHelper.delete() parameter, userId: ${userId} is less than or equal to zero`);
    }
    return this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        body: {
          id: userId
        }
      }
    );
  }
}

export default ContactHelper;

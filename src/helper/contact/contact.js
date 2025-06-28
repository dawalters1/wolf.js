import BaseHelper from '../baseHelper.js';
import BlockedHelper from './blocked.js';
import { Command } from '../../constants/Command.js';
import Contact from '../../entities/contact.js';

class ContactHelper extends BaseHelper {
  constructor (client) {
    super(client);
    this.blocked = new BlockedHelper(client);
  }

  async list (opts) {
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
        existing
          ? existing.patch(serverContact)
          : new Contact(this.client, serverContact)
      );
    });
  }

  async isContact (userId) {
    await this.list();
    return this.cache.has(userId);
  }

  async add (userId) {
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

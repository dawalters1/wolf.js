import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Contact from '../../entities/contact.js';

class BlockedHelper extends BaseHelper {
  async list (opts) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_LIST,
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

  async isBlocked (userId) {
    await this.list();
    return this.cache.has(userId);
  }

  async block (userId) {
    return this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_ADD,
      {
        body: {
          id: userId
        }
      }
    );
  }

  async unblock (userId) {
    return this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_DELETE,
      {
        body: {
          id: userId
        }
      }
    );
  }
}

export default BlockedHelper;

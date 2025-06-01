import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import Contact from '../../structures/contact.ts';
import { ContactOptions } from '../../options/requestOptions.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class BlockedHelper extends BaseHelper<Contact> {
  async list (opts?: ContactOptions) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit<Contact[]>(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this.cache.fetched = true;

    return this.cache?.setAll(response.body);
  }

  async isBlocked (userId: number): Promise<boolean> {
    await this.list();

    return this.cache.has(userId);
  }

  async block (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_ADD,
      {
        body: {
          id: userId
        }
      }
    );
  }

  async unblock (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
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

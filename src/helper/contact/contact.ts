
import BaseHelper from '../baseHelper.ts';
import BlockedHelper from './blocked.ts';
import { Command } from '../../constants/Command.ts';
import Contact from '../../structures/contact.ts';
import { ContactOptions } from '../../options/requestOptions.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class ContactHelper extends BaseHelper<Contact> {
  blocked: Readonly<BlockedHelper>;

  constructor (client: WOLF) {
    super(client);
    this.blocked = new BlockedHelper(client);
  }

  async list (opts?: ContactOptions) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit<Contact[]>(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        body: {
          subscribe: true
        }
      });

    this.cache.fetched = true;

    return this.cache.setAll(response.body);
  }

  async isContact (userId: number): Promise<boolean> {
    await this.list();

    return this.cache.has(userId);
  }

  async add (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_ADD,
      {
        body: {
          id: userId
        }
      });
  }

  async delete (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_CONTACT_DELETE,
      {
        body: {
          id: userId
        }
      });
  }
}

export default ContactHelper;

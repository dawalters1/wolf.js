
import BaseHelper from '../baseHelper.ts';
import BlockedHelper from './blocked.ts';
import { Command } from '../../constants/Command.ts';
import Contact, { ServerContact } from '../../structures/contact.ts';
import { ContactOptions } from '../../options/requestOptions.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class ContactHelper extends BaseHelper<Contact> {
  readonly blocked: BlockedHelper;

  constructor (client: WOLF) {
    super(client);
    this.blocked = new BlockedHelper(client);
  }

  async list (opts?: ContactOptions) {
    if (!opts?.forceNew && this.cache.fetched) {
      return this.cache.values();
    }

    const response = await this.client.websocket.emit<ServerContact[]>(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this.cache.fetched = true;

    return response.body.map((serverContact) => {
      const existing = this.cache.get(serverContact.id);

      return this.cache.set(
        existing
          ? existing.patch(serverContact)
          : new Contact(this.client, serverContact)
      );
    });
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
      }
    );
  }

  async delete (userId: number): Promise<WOLFResponse> {
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

export default ContactHelper;

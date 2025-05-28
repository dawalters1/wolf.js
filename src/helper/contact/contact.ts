/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import { Command } from '../../constants/Command.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { ContactOptions } from '../../options/requestOptions.ts';
import Contact from '../../structures/contact.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';
import BlockedHelper from './blocked.ts';

class ContactHelper extends Base<CacheManager<Contact, Map<number, Contact>>> {
  blocked: BlockedHelper;

  constructor (client: WOLF) {
    super(client, new CacheManager(new Map()));
    this.blocked = new BlockedHelper(client);
  }

  async list (opts?: ContactOptions) {
    if (!opts?.forceNew && this.cache!.fetched) {
      return this.cache!.values();
    }

    const response = await this.client.websocket.emit<Contact[]>(
      Command.SUBSCRIBER_CONTACT_LIST,
      {
        body: {
          subscribe: true
        }
      });

    this.cache!.fetched = true;

    return this.cache?.mset(response.body);
  }

  async isContact (userId: number): Promise<boolean> {
    await this.list();

    return this.cache!.has(userId);
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

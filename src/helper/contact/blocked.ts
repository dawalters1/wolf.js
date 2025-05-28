/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import { Command } from '../../constants/Command.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { ContactOptions } from '../../options/requestOptions.ts';
import Contact from '../../structures/contact.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

class BlockedHelper extends Base<CacheManager<Contact, Map<number, Contact>>> {
  constructor (client: WOLF) {
    super(client, new CacheManager(new Map()));
  }

  async list (opts?: ContactOptions) {
    if (!opts?.forceNew && this.cache!.fetched) {
      return this.cache!.values();
    }

    const response = await this.client.websocket.emit<Contact[]>(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        body: {
          subscribe: true
        }
      });

    this.cache!.fetched = true;

    return this.cache?.mset(response.body);
  }

  async isBlocked (userId: number): Promise<boolean> {
    await this.list();

    return this.cache!.has(userId);
  }

  async block (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_ADD,
      {
        body: {
          id: userId
        }
      });
  }

  async unblock (userId: number): Promise<WOLFResponse> {
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_DELETE,
      {
        body: {
          id: userId
        }
      });
  }
}

export default BlockedHelper;

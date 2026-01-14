import BaseHelper from '../BaseHelper.js';
import BlockedHelper from './Blocked.js';
import Contact from '../../entities/Contact.js';

export default class ContactHelper extends BaseHelper {
  #blocked;

  constructor (client) {
    super(client);

    this.#blocked = new BlockedHelper(client);
  }

  get blocked () {
    return this.#blocked;
  }

  async fetch (opts) {
    if (!opts?.forceNew && this.store.fetched) { return this.store.values(); }

    const response = await this.client.websocket.emit(
      'subscriber contact list',
      {
        body: {
          subscribe: true
        }
      }
    );

    this.store.clear();
    this.store.fetched = true;

    const maxAge = response.headers?.maxAge;

    return response.body.map(
      (serverContact) =>
        this.store.set(
          new Contact(this.client, serverContact),
          maxAge
        )
    );
  }

  async add (userId) {
    const normalisedUserId = this.normaliseNumber(userId);

    return this.client.websocket.emit(
      'subscriber contact add',
      {
        body: {
          id: normalisedUserId
        }
      }
    );
  }

  async remove (userId) {
    const normalisedUserId = this.normaliseNumber(userId);

    return this.client.websocket.emit(
      'subscriber contact delete',
      {
        body: {
          id: normalisedUserId
        }
      }
    );
  }
}

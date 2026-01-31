import BaseHelper from '../BaseHelper.js';
import Contact from '../../entities/Contact.js';
import { validate } from '../../validation/Validation.js';

export default class BlockedHelper extends BaseHelper {
  async fetch (opts) {
    if (!opts?.forceNew && this.store.fetched) { return this.store.values(); }

    const response = await this.client.websocket.emit(
      'subscriber blocked list',
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

    validate(normalisedUserId, this, this.add)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return this.client.websocket.emit(
      'subscriber block add',
      {
        body: {
          id: normalisedUserId
        }
      }
    );
  }

  async remove (userId) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.remove)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return this.client.websocket.emit(
      'subscriber block delete',
      {
        body: {
          id: normalisedUserId
        }
      }
    );
  }
}

import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Contact from '../../entities/contact.js';
import { validate } from '../../validator/index.js';

class BlockedHelper extends BaseHelper {
  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'BlockedHelper.list() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew && this.store.fetched) {
      return this.store.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this.store._fetched = true;
    this.store.clear();

    return response.body.map(
      (serverContact) =>
        this.store.set(
          new Contact(this.client, serverContact),
          response.headers?.maxAge
        )
    );
  }

  async isBlocked (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`BlockedHelper.isBlocked() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`BlockedHelper.isBlocked() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `BlockedHelper.isBlocked() parameter, userId: ${userId} is less than or equal to zero`);
    }

    await this.list();
    return this.store.has(userId);
  }

  async block (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`BlockedHelper.block() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`BlockedHelper.block() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `BlockedHelper.block() parameter, userId: ${userId} is less than or equal to zero`);
    }

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
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`BlockedHelper.unblock() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`BlockedHelper.unblock() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `BlockedHelper.unblock() parameter, userId: ${userId} is less than or equal to zero`);
    }

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

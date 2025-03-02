'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import BlockedCache from '../../cache/BlockedCache.js';
// Variables
import { Command } from '../../constants/index.js';

class Blocked extends Base {
  constructor (client) {
    super(client);

    this.blockedCache = BlockedCache();
  }

  async list (forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Blocked.list() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew && this.blockedCache.fetched) {
      return this.blockedCache.list();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this.blockedCache.fetched = true;

    return this.blockedCache.set(response.body.map((blockedUser) => new structures.Contact(this.client, blockedUser)));
  }

  async block (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValuserIdNumber(userId)) {
        throw new Error(`Blocked.block() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Blocked.block() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

    return await this.client.websocket.emit(
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
      if (!verify.isValuserIdNumber(userId)) {
        throw new Error(`Blocked.unblock() parameter, userId: ${JSON.stringify(userId)}, is not a valuserId number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`Blocked.unblock() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }
    }

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

export default Blocked;

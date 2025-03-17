'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
import DataManager from '../../managers/DataManager.js';
// Variables
import { Command } from '../../constants/index.js';

class Blocked extends Base {
  constructor (client) {
    super(client);

    this._blocked = new DataManager();
  }

  async list () {
    if (this._blocked._fetched) {
      return this._blocked.cache.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        body: {
          subscribe: true
        }
      }
    );

    this._blocked._fetched = true;

    return response.body.map((blockedUser) =>
      this._blocked._add(new structures.Contact(this.client, blockedUser))
    );
  }

  async block (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
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
      if (!verify.isValidNumber(userId)) {
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

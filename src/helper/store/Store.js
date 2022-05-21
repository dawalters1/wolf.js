const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const { Command } = require('../../constants');

class Store extends Base {
  constructor (client) {
    super(client);

    this._balance = -1;
  }

  async getCreditBalance (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this._balance >= 0) {
      return this._balance;
    }

    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);

    if (response.success) {
      this._balance = response.body.balance;
    }

    return this._balance >= 0 ? this._balance : 0;
  }

  // TODO: V3 store
}

module.exports = Store;

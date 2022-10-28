import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command, StoreType } from '../../constants/index.js';
import models from '../../models/index.js';
import fs from 'fs';

class Store extends Base {
  constructor (client) {
    super(client);
    this._balance = undefined;
    this._store = [];
  }

  async get (language, type = StoreType.SIMPLE) {
    // TODO: validation

    const response = await this.client.websocket.emit(
      Command.TOPIC_PAGE_LAYOUT,
      {
        languageId: parseInt(language),
        name: 'store'
      }
    );

    fs.writeFileSync('store.json', JSON.stringify(response, null, 4));
  }

  async getCreditBalance (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this._balance >= 0) {
      return this._balance;
    }

    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);

    return response.success ? this._processBalance(response.body.balance) : (this._balance || 0);
  }

  _processBalance (balance) {
    this._balance = balance;

    return balance;
  }
}

export default Store;

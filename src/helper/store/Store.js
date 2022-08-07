import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
class Store extends Base {
  constructor (client) {
    super(client);
    this._balance = -1;
    this._store = [];
  }

  async getCreditBalance (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }
    if (!forceNew && this._balance >= 0) {
      return this._balance;
    }
    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);
    return response.success ? this._processBalance(response.body.balance) : this._balance > 0 ? this._balance : 0;
  }

  _processBalance (balance) {
    this._balance = balance;
    return balance;
  }
}
export default Store;

import { Command } from '../../constants/Command.js';
import StoreProductHelper from './storeProduct.js';

class StoreHelper {
  constructor (client) {
    this.client = client;
    this.product = new StoreProductHelper(this.client);
    this._balance = -1;
  }

  async balance () {
    if (this._balance >= 0) {
      return this._balance;
    }

    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);
    this._balance = response.body.balance;
    return this._balance;
  }
}

export default StoreHelper;

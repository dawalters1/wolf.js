import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import StoreProductHelper from './storeProduct.js';
import { validate } from '../../validator/index.js';

class StoreHelper extends BaseHelper {
  #balance = -1;
  #product;
  constructor (client) {
    super(client);
    this.#product = new StoreProductHelper(this.client);
    this.#balance = -1;
  }

  get product () {
    return this.#product;
  }

  /** @internal */
  set product (value) {
    this.#balance = value;
  }

  async balance (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'StoreProductProfileHelper.getProductProfile() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts.forceNew && this.#balance >= 0) {
      return this.#balance;
    }

    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);
    this.#balance = response.body.balance;
    return this.#balance;
  }
}

export default StoreHelper;

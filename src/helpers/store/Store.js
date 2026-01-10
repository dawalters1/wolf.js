import BaseHelper from '../BaseHelper.js';
import StoreProductHelper from './StoreProductHelper.js';

export default class StoreHelper extends BaseHelper {
  #balance = null;
  #product;

  constructor (client) {
    super(client);

    this.#product = new StoreProductHelper(client);
  }

  get product () {
    return this.#product;
  }

  /** @internal */
  get _balance () {
    return this.#balance;
  }

  /** @internal */
  set _balance (value) {
    this.#balance = value;
  }

  async balance (opts) {
    if (!opts?.forceNew && this.#balance !== null) { return this.#balance; }

    const response = await this.client.websocket.emit(
      'store credit balance'
    );

    this.#balance = response.body.balance;

    return this.#balance;
  }
}

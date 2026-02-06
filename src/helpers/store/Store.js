import BaseHelper from '../BaseHelper.js';
import Language from '../../constants/Language.js';
import StoreProduct from './StoreProduct.js';
import { validate } from '../../validation/Validation.js';

export default class StoreHelper extends BaseHelper {
  #balance = null;
  #product;

  constructor (client) {
    super(client);

    this.#product = new StoreProduct(client);
  }

  /** @internal */
  get _balance () {
    return this.#balance;
  }

  get product () {
    return this.#product;
  }

  /** @internal */
  set _balance (value) {
    this.#balance = value;
  }

  async fetch (languageId, opts) {
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedLanguageId, this, this.fetch)
      .isNotNullOrUndefined()
      .in(Object.values(Language));

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    return await this.client.topic.fetch('store', languageId, opts);
  }

  async balance (opts) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    validate(opts, this, this.balance)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew && this.#balance !== null) { return this.#balance; }

    const response = await this.client.websocket.emit(
      'store credit balance',
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    this.#balance = response.body.balance;

    return this.#balance;
  }
}

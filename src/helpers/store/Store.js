import BaseHelper from '../BaseHelper.js';
import Language from '../../constants/Language.js';
import StoreBalanceType from '../../constants/StoreBalanceType.js';
import StoreProduct from './StoreProduct.js';
import { validate } from '../../validation/Validation.js';

export default class StoreHelper extends BaseHelper {
  #gold = null;
  #jawaher = null;
  #product;

  constructor (client) {
    super(client);

    this.#product = new StoreProduct(client);
  }

  /** @internal */
  get _gold () {
    return this.#gold;
  }

  get _jawaher () {
    return this.#jawaher;
  }

  get product () {
    return this.#product;
  }

  /** @internal */
  set _gold (value) {
    this.#gold = value;
  }

  /** @internal */
  set _jawaher (value) {
    this.#jawaher = value;
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

  async balance (balanceType, opts) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    validate(balanceType, this, this.balance)
      .isNotNullOrUndefined()
      .in(Object.values(StoreBalanceType));

    validate(opts, this, this.balance)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew) {
      if (balanceType === StoreBalanceType.GOLD && this.#gold !== null) {
        return this.#gold;
      }

      if (balanceType === StoreBalanceType.JAWAHER && this.#jawaher !== null) {
        return this.#jawaher;
      }
    }

    const response = await this.client.websocket.emit(
      balanceType === StoreBalanceType.GOLD
        ? 'store credit balance'
        : 'store jawaher balance',
      {
        body: {
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    if (balanceType === StoreBalanceType.GOLD) {
      this.#gold = response.body.balance;
      return this.#gold;
    }

    if (balanceType === StoreBalanceType.JAWAHER) {
      this.#jawaher = response.body.balance;
      return this.#jawaher;
    }
  }
}

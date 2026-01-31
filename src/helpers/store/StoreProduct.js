import BaseHelper from '../BaseHelper.js';
import Language from '../../constants/Language.js';
import StoreProduct from '../../entities/StoreProduct.js';
import StoreProductProfile from './StoreProductProfile.js';
import { validate } from '../../validation/Validation.js';

export default class StoreProductHelper extends BaseHelper {
  #profile;
  constructor (client) {
    super(client);
    this.#profile = new StoreProductProfile(client);
  }

  get profile () {
    return this.#profile;
  }

  async fetch (productIds, languageId, opts) {
    const isArrayResponse = Array.isArray(productIds);
    const normalisedProductIds = this.normaliseNumbers(productIds);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedProductIds, this, this.fetch)
      .isArray()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(languageId, this, this.fetch)
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

    const idsToFetch = opts?.forceNew
      ? normalisedProductIds
      : normalisedProductIds.filter((productId) => !this.store.has((item) => item.id === productId && item.languageId === normalisedLanguageId));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'store product',
        {
          headers: {
            version: 1
          },
          body: {
            idList: idsToFetch,
            languageId: normalisedLanguageId
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const id = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.store.set(
          new StoreProduct(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const products = normalisedProductIds.map((productId) => this.store.get((item) => item.id === productId && item.languageId === normalisedLanguageId));

    return isArrayResponse
      ? products
      : products[0];
  }
}

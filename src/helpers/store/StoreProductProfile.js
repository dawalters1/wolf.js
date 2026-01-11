import BaseHelper from '../BaseHelper.js';
import { StatusCodes } from 'http-status-codes';
import StoreProductProfile from '../../entities/StoreProductProfile.js';

export default class StoreProductProfileHelper extends BaseHelper {
  async fetch (productId, languageId, opts) {
    const normalisedProductId = this.normaliseNumber(productId);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    if (!opts?.forceNew) {
      const cached = this.store.find((item) => item.id === productId && item.languageId === normalisedLanguageId);

      if (cached) { return cached; }
    }
    try {
      const response = await this.client.websocket.emit(
        'store product profile',
        {
          headers: {
            version: 1
          },
          body: {
            id: normalisedProductId,
            languageId: normalisedLanguageId
          }
        }
      );

      return this.store.set(
        new StoreProductProfile(this.client, response.body),
        response.headers?.maxAge
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
      this.store.delete((item) => item.id === productId && item.languageId === normalisedLanguageId);
      return null;
    }
  }
}

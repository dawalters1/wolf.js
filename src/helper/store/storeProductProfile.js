import BaseHelper from '../baseHelper.js';
import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import StoreProductProfile from '../../entities/storeProductProfile.js';
import { validate } from '../../validator/index.js';

class StoreProductProfileHelper extends BaseHelper {
  async get (productId, languageId, opts) {
    productId = Number(productId) || productId;

    { // eslint-disable-line no-lone-blocks
      validate(productId)
        .isNotNullOrUndefined(`StoreProductProfileHelper.getProductProfile() parameter, productId: ${productId} is null or undefined`)
        .isValidNumber(`StoreProductProfileHelper.getProductProfile() parameter, productId: ${productId} is not a valid number`)
        .isGreaterThan(0, `StoreProductProfileHelper.getProductProfile() parameter, productId: ${productId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`StoreProductProfileHelper.getProductProfile() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `StoreProductProfileHelper.getProductProfile() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'StoreProductProfileHelper.getProductProfile() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cached = this.store.get((productProfile) => productProfile.id === productId && productProfile.languageId === languageId);
      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.STORE_PRODUCT_PROFILE,
        {
          body: {
            languageId,
            id: productId
          }
        }
      );

      return this.store.set(
        new StoreProductProfile(this.client, response.body),
        response.headers?.maxAge
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }

      throw error;
    }
  }
}

export default StoreProductProfileHelper;

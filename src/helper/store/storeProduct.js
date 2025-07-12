import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import StoreProduct from '../../entities/storeProduct.js';
import StoreProductProfile from '../../entities/storeProductProfile.js';
import { validate } from '../../validator/index.js';

class StoreProductHelper extends BaseHelper {
  async getById (productId, languageId, opts) {
    productId = Number(productId) || productId;

    { // eslint-disable-line no-lone-blocks
      validate(productId)
        .isNotNullOrUndefined(`StoreProductHelper.getById() parameter, productId: ${productId} is null or undefined`)
        .isValidNumber(`StoreProductHelper.getById() parameter, productId: ${productId} is not a valid number`)
        .isGreaterThanZero(`StoreProductHelper.getById() parameter, productId: ${productId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`StoreProductHelper.getById() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `StoreProductHelper.getById() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'EventHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([productId], languageId, opts))[0];
  }

  async getByIds (productIds, languageId, opts) {
    productIds = productIds.map((channelId) => Number(channelId) || channelId);

    { // eslint-disable-line no-lone-blocks
      validate(productIds)
        .isValidArray(`StoreProductHelper.getByIds() parameter, productIds: ${productIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is null or undefined')
        .isValidNumber('StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`StoreProductHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `StoreProductHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'StoreProductHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }
    const productsMap = new Map();

    if (!opts?.forceNew) {
      const cachedProducts = this.cache.getAll(productIds)
        .filter((product) => product !== null && product.hasLanguage(languageId));

      cachedProducts.forEach((product) => productsMap.set(product.id, product));
    }

    const idsToFetch = productIds.filter((id) => !productsMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.STORE_PRODUCT,
        {
          body: {
            idList: idsToFetch,
            languageId
          }
        }
      );

      response.body
        .filter((res) => res.success)
        .forEach((res) => {
          const existing = this.cache.get(res.body.id);

          productsMap.set(
            res.body.id,
            this.cache.set(
              existing
                ? existing.patch(res.body)
                : new StoreProduct(this.client, res.body)
            )
          );
        });
    }

    return productIds.map((id) => productsMap.get(id) ?? null);
  }

  async getProductProfile (productId, languageId, opts) {
    productId = Number(productId) || productId;

    { // eslint-disable-line no-lone-blocks
      validate(productId)
        .isNotNullOrUndefined(`StoreProductHelper.getProductProfile() parameter, productId: ${productId} is null or undefined`)
        .isValidNumber(`StoreProductHelper.getProductProfile() parameter, productId: ${productId} is not a valid number`)
        .isGreaterThanZero(`StoreProductHelper.getProductProfile() parameter, productId: ${productId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`StoreProductHelper.getProductProfile() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `StoreProductHelper.getProductProfile() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'EventHelper.getProductProfile() parameter, opts.{parameter}: {value} {error}');
    }

    const product = await this.getById(productId, languageId);

    if (product === null) {
      throw new Error(`Product with id ${productId} not found`);
    }

    if (!opts?.forceNew && product.profile && product.profile.hasLanguage(languageId)) {
      return product.profile;
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

      product.profile = product.profile?.patch(response.body) ?? new StoreProductProfile(this.client, response.body);
      return product.profile;
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async purchase () {
    throw new Error('NOT IMPLEMENTED');
  }
}

export default StoreProductHelper;

import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import StoreProduct from '../../entities/storeProduct.js';
import StoreProductProfileHelper from './storeProductProfile.js';
import { validate } from '../../validator/index.js';

class StoreProductHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.profile = new StoreProductProfileHelper(this.client);
  }

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
      const cachedProducts = this.cache.getAll(productIds, languageId)
        .filter((product) => product !== null);

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
          const existing = this.cache.get(res.body.id, languageId);

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

  async purchase () {
    throw new Error('NOT IMPLEMENTED');
  }
}

export default StoreProductHelper;

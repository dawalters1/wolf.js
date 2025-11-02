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
        .isGreaterThan(0, `StoreProductHelper.getById() parameter, productId: ${productId} is less than or equal to zero`);

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
        .isArray(`StoreProductHelper.getByIds() parameter, productIds: ${productIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is null or undefined')
        .isValidNumber('StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'StoreProductHelper.getByIds() parameter, productId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`StoreProductHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `StoreProductHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'StoreProductHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }
    const idsToFetch = opts?.forceNew
      ? productIds
      : productIds.filter((productId) =>
        !this.store.has((product) =>
          product.id === productId && product.languageId === languageId
        )
      );

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

      for (const [index, serverStoreProductResponse] of response.body.entries()) {
        const productId = idsToFetch[index];

        if (!serverStoreProductResponse.success) {
          this.store.delete(
            (serverStoreProduct) =>
              serverStoreProduct.id === productId && serverStoreProduct.languageId === languageId
          );
          continue;
        }

        this.store.set(
          new StoreProduct(this.client, serverStoreProductResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return productIds.map((productId) =>
      this.store.get((product) =>
        product.id === productId && product.languageId === languageId
      )
    );
  }

  async purchase () {
    throw new Error('NOT IMPLEMENTED');
  }
}

export default StoreProductHelper;

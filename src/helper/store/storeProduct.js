import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { StatusCodes } from 'http-status-codes';
import StoreProduct from '../../entities/storeProduct.js';
import StoreProductProfile from '../../entities/storeProductProfile.js';

class StoreProductHelper extends BaseHelper {
  async getById (productId, languageId, opts) {
    return (await this.getByIds([productId], languageId, opts))[0];
  }

  async getByIds (productIds, languageId, opts) {
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

import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command, Language } from '../../constants/index.js';
import models, { WOLFAPIError } from '../../models/index.js';
import patch from '../../utils/patch.js';
import _ from 'lodash';
import StoreProduct from '../../models/StoreProduct.js';
import TopicPageRecipeType from '../../constants/TopicPageRecipeType.js';

class Store extends Base {
  constructor (client) {
    super(client);
    this._balance = undefined;

    this._store = {};
    this._pages = {};
    this._products = {};
    this._productProfiles = {};
  }

  async _getPage (page, languageId) {
    const cached = this._pages[`${languageId}:${page}`];

    if (cached) {
      return cached;
    }

    const response = await this.client.topic.getTopicPageLayout(page, languageId);

    return response.success ? this._processPage(new models.Store(this.client, response.body, languageId)) : undefined;
  }

  async get (languageId) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new Error('languageId is not valid', { languageId });
    }

    return this._getPage('store', languageId);
  }

  async getProducts (ids, languageId, maxResults, offset, type) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new Error('languageId is not valid', { languageId });
    }

    if (validator.isNullOrUndefined(maxResults)) {
      throw new models.WOLFAPIError('maxResults cannot be null or undefined', { maxResults });
    } else if (!validator.isValidNumber(maxResults)) {
      throw new models.WOLFAPIError('maxResults must be a valid number', { maxResults });
    } else if (validator.isLessThanOrEqualZero(maxResults)) {
      throw new models.WOLFAPIError('maxResults cannot be less than or equal to 0', { maxResults });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanOrEqualZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than or equal to 0', { offset });
    }

    if (!validator.isNullOrUndefined(type)) {
      throw new models.WOLFAPIError('type cannot be null or undefined', { type });
    } else if (!Object.values(TopicPageRecipeType).includes(type)) {
      throw new Error('type is not valid', { type });
    }

    const productIds = (await this.client.topic.getTopicPageRecipeList(ids, languageId, maxResults, offset, type)).body?.map((productPartial) => productPartial.id) ?? [];

    const products = productIds.reduce((result, productId) => {
      if (this._products[productId] && this._products[productId][languageId]) {
        result.push(this._products[productId][languageId]);
      }

      return result;
    }, []);

    if (products.length !== productIds.length) {
      const idLists = _.chunk(productIds.filter((productId) => !products.some((product) => product.id === productId), this.client._botConfig.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.STORE_PRODUCT,
          {
            languageId: parseInt(languageId),
            idList
          }
        );

        if (response.success) {
          const productResponses = Object.values(response.body).map((achievementResponse) => new models.Response(achievementResponse));

          for (const [index, productResponse] of productResponses.entries()) {
            products.push(productResponse.success ? this._processProduct(new models.StoreSectionElementProduct(this.client, productResponse.body, languageId)) : new models.StoreSectionElementProduct(this.client, { id: idList[index] }));
          }
        } else {
          products.push(...idList.map((id) => new models.StoreSectionElementProduct(this.client, { id })));
        }
      }
    }

    return products;
  }

  async getProductProfile (id, languageId) {
    if (Array.isArray(id)) {
      throw new WOLFAPIError('id cannot be type of array', { id });
    } else if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new Error('languageId is not valid', { languageId });
    }

    if (this._productProfiles[id] && this._productProfiles[id][languageId]) {
      return this._productProfiles[id][languageId];
    }

    const response = await this.client.websocket.emit(
      Command.STORE_PRODUCT_PROFILE,
      {
        languageId: parseInt(languageId),
        id: parseInt(id)
      }
    );

    return response.success ? this._processProductProfile(new StoreProduct(this.client, response.body, languageId)) : undefined;
  }

  async purchase (productDurationId, quanitity, ids) {
    if (validator.isNullOrUndefined(productDurationId)) {
      throw new models.WOLFAPIError('productDurationId cannot be null or undefined', { productDurationId });
    } else if (!validator.isValidNumber(productDurationId)) {
      throw new models.WOLFAPIError('productDurationId must be a valid number', { productDurationId });
    } else if (validator.isLessThanOrEqualZero(productDurationId)) {
      throw new models.WOLFAPIError('productDurationId cannot be less than or equal to 0', { productDurationId });
    }

    if (validator.isNullOrUndefined(quanitity)) {
      throw new models.WOLFAPIError('quanitity cannot be null or undefined', { quanitity });
    } else if (!validator.isValidNumber(quanitity)) {
      throw new models.WOLFAPIError('quanitity must be a valid number', { quanitity });
    } else if (validator.isLessThanOrEqualZero(quanitity)) {
      throw new models.WOLFAPIError('quanitity cannot be less than or equal to 0', { quanitity });
    }

    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    return await this.client.websocket.emit(
      Command.STORE_CREDIT_SPEND, {
        idList: ids,
        productList: [
          {
            id: parseInt(productDurationId),
            quanitity: parseInt(quanitity)
          }
        ]
      }
    );
  }

  async getCreditBalance (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this._balance >= 0) {
      return this._balance;
    }

    const response = await this.client.websocket.emit(Command.STORE_CREDIT_BALANCE);

    return response.success ? this._processBalance(response.body.balance) : (this._balance || 0);
  }

  _processBalance (balance) {
    this._balance = balance;

    return balance;
  }

  _processPage (value) {
    const existing = this._pages[`${value.languageId}:${value.id}`];

    existing ? patch(existing, value) : this._pages[`${value.languageId}:${value.id}`] = value;

    return value;
  }

  _processProduct (value) {
    if (!this._products[value.id]) {
      this._products[value.id] = {};
    }

    const existing = this._products[value.id][value.languageId];

    existing ? patch(existing, value) : this._products[value.id][value.languageId] = value;

    return value;
  }

  _processProductProfile (value) {
    if (!this._productProfiles[value.id]) {
      this._productProfiles[value.id] = {};
    }

    const existing = this._productProfiles[value.id][value.languageId];

    existing ? patch(existing, value) : this._productProfiles[value.id][value.languageId] = value;

    return value;
  }
}

export default Store;

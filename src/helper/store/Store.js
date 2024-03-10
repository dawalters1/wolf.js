import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command, Language } from '../../constants/index.js';
import models, { StoreProductCredits, WOLFAPIError } from '../../models/index.js';
import patch from '../../utils/patch.js';
import _ from 'lodash';
import StoreProduct from '../../models/StoreProduct.js';

class Store extends Base {
  constructor (client) {
    super(client);

    this._balance = undefined;

    this._credits = {};
    this.stores = {};
    this._products = {};
    this._productProfiles = {};
  }

  /**
   * Request a page
   * @param {string} page  - The page to request
   * @param {Language} languageId  - The language ID to request
   * @param {Boolean} forceNew - Whether or not to request new from the server
   * @internal - Recommended for internal use only, use client.topic.getTopicPageLayout(...) instead
   * @returns Returns requested page if exists
   */
  async _getPage (page, languageId, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    if (!forceNew && this.stores[languageId]?.pages[page]) {
      return this.stores[languageId]?.pages[page];
    }

    const response = await this.client.topic.getTopicPageLayout(page, languageId);

    if (response.success) {
      this.stores[languageId] = {
        ...this.stores[languageId],
        pages: {
          ...this.stores[languageId]?.pages,
          [page]: new models.StorePage(this.client, response.body, languageId)
        }
      };
    }

    return this.stores[languageId]?.pages[page];
  }

  /**
   * Get list of purchasable credits
   * @param {Number} languageId
   * @param {Boolean} forceNew
   * @returns {Promise<StoreProductCredits>}
   */
  async getCreditList (languageId, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    if (!forceNew && this._credits[languageId]?.length) {
      return this._credits[languageId];
    }

    const response = await this.client.websocket.emit(
      Command.STORE_PRODUCT_CREDIT_LIST,
      {
        languageId: parseInt(languageId)
      }
    );

    this._credits[languageId] = response.body?.map((credits) => new StoreProductCredits(this.client, credits)) ?? [];

    return this._credits[languageId];
  }

  /**
   * Get store
   * @param {Number} languageId
   * @param {Boolean} includeCredits
   * @param {Boolean} forceNew
   * @returns {Promise<Store>}
   */
  async get (languageId, includeCredits = true, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(includeCredits)) {
        throw new models.WOLFAPIError('includeCredits must be a valid boolean', { includeCredits });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    if (!forceNew && this.stores[languageId]?.main) {
      return this.stores[languageId].main;
    }

    const response = await this.client.topic.getTopicPageLayout('store', languageId);

    if (response.success) {
      this.stores[languageId] = {
        main: new models.Store(this.client, includeCredits ? await this.getCreditList(languageId, forceNew) : undefined, response.body, languageId),
        pages: {
          ...this.stores[languageId]?.pages
        }
      };
    }

    return this.stores[languageId]?.main;
  }

  /**
   * Request partial products from the server
   * @param {Number | Number[]} ids
   * @param {Number} languageId
   * @returns {Promise<StoreProductPartial | Array<StoreProductPartial>>}
   */
  async getProducts (ids, languageId) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!ids.length) {
        return [];
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
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }
    }

    const products = ids.reduce((result, productId) => {
      if (this._products[productId] && this._products[productId][languageId]) {
        result.push(this._products[productId][languageId]);
      }

      return result;
    }, []);

    if (products.length === ids.length) {
      return products;
    }

    const idLists = _.chunk(ids.filter((productId) => !products.some((product) => product.id === productId)), this.client._frameworkConfig.get('batching.length'));

    for (const idList of idLists) {
      const response = await this.client.websocket.emit(
        Command.STORE_PRODUCT,
        {
          languageId: parseInt(languageId),
          idList
        }
      );

      if (response.success) {
        products.push(...Object.values(response.body)
          .map((productResponse) => new models.Response(productResponse))
          .map((productResponse, index) =>
            productResponse.success
              ? this._processProduct(new models.StoreProductPartial(this.client, productResponse.body, languageId))
              : new models.StoreProductPartial(this.client, { id: idList[index] })
          )
        );
      } else {
        products.push(...idList.map((id) => new models.StoreProductPartial(this.client, { id })));
      }
    }

    return products;
  }

  /**
   * Get products full profile
   * @param {Number} id
   * @param {Number} languageId
   * @returns {Promise<StoreProduct>}
   */
  async getFullProduct (id, languageId) {
    { // eslint-disable-line no-lone-blocks
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
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }
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

  /**
   * Purchase a product
   * @param {Number} productDurationId
   * @param {Number} quantity
   * @param {Number | Number[]} ids
   * @returns {Promise<Response>}
   */
  async purchase (productDurationId, quantity, ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(productDurationId)) {
        throw new models.WOLFAPIError('productDurationId cannot be null or undefined', { productDurationId });
      } else if (!validator.isValidNumber(productDurationId)) {
        throw new models.WOLFAPIError('productDurationId must be a valid number', { productDurationId });
      } else if (validator.isLessThanOrEqualZero(productDurationId)) {
        throw new models.WOLFAPIError('productDurationId cannot be less than or equal to 0', { productDurationId });
      }

      if (validator.isNullOrUndefined(quantity)) {
        throw new models.WOLFAPIError('quantity cannot be null or undefined', { quantity });
      } else if (!validator.isValidNumber(quantity)) {
        throw new models.WOLFAPIError('quantity must be a valid number', { quantity });
      } else if (validator.isLessThanOrEqualZero(quantity)) {
        throw new models.WOLFAPIError('quantity cannot be less than or equal to 0', { quantity });
      }

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
    }

    return await this.client.websocket.emit(
      Command.STORE_CREDIT_SPEND, {
        idList: ids,
        productList: [
          {
            id: parseInt(productDurationId),
            quantity: parseInt(quantity)
          }
        ]
      }
    );
  }

  /**
   * Get the Bots credit balance
   * @param {Boolean} forceNew
   * @returns {Promise<number>}
   */
  async getCreditBalance (forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
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

  _cleanUp (reconnection = false) {
    this._credits = {};
    this._balance = -1;
    this._products = {};
    this._productProfiles = {};

    if (!reconnection) {
      this.stores = {};
    }
  }
}

export default Store;

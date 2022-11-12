import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import patch from '../../utils/patch.js';
import _ from 'lodash';

class Store extends Base {
  constructor (client) {
    super(client);
    this._balance = undefined;

    this._store = {};
    this._pages = {};
    this._products = {};
  }

  async _getPage (page, languageId) {
    const cached = this._pages[`${languageId}:${page}`];

    if (cached) {
      return cached;
    }

    const response = await this.client.topic.getTopicPageLayout(page, languageId);

    return response.success ? this._processPage(new models.Store(this.client, response.body), languageId) : undefined;
  }

  async get (languageId) {
    return this._getPage('store', languageId);
  }

  async getProducts (id, languageId, maxResults, offset, type) {
    const productIds = (await this.client.topic.getTopicPageRecipeList(id, languageId, maxResults, offset, type)).body?.map((productPartial) => productPartial.id) ?? [];

    const products = this._products[languageId]?.filter((product) => productIds.includes(product.id)) ?? [];

    if (products.length !== productIds.length) {
      const idLists = _.chunk(productIds.filter((productId) => !products.some((product) => product.id === productId), this.client._botConfig.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.STORE_PRODUCT,
          {
            languageId,
            idList
          }
        );

        if (response.success) {
          const productResponses = Object.values(response.body).map((achievementResponse) => new models.Response(achievementResponse));

          for (const [index, productResponse] of productResponses.entries()) {
            products.push(productResponse.success ? this._processProduct(new models.StoreSectionElementProduct(this.client, productResponse.body), languageId) : new models.StoreSectionElementProduct(this.client, { id: idList[index] }));
          }
        } else {
          products.push(...idList.map((id) => new models.StoreSectionElementProduct(this.client, { id })));
        }
      }
    }

    return products;
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

  _processPage (value, language) {
    const existing = this._pages[`${language}:${value.id}`];

    existing ? patch(existing, value) : this._pages[`${language}:${value.id}`] = value;

    return value;
  }

  _processProduct (value, language) {
    if (!this._products[language]) {
      this._products[language] = [];
    }

    (Array.isArray(value) ? value : [value]).forEach((achievement) => {
      const existing = this._products[language].find((cached) => achievement.id === cached.id);

      existing ? patch(existing, value) : this._products[language].push(value);
    });

    return value;
  }
}

export default Store;

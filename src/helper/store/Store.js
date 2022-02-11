const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');
const { Commands } = require('../../constants');
const Response = require('../../models/ResponseObject');

class Store extends BaseHelper {
  constructor (api) {
    super(api);

    this._balance = -1;

    this._store = {};

    this._sectionProductIds = {};

    this._products = {};
  }

  async getBalance (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._balance >= 0) {
        return this._balance;
      }

      const result = await this._websocket.emit(Commands.STORE_CREDIT_BALANCE);

      if (result.success) {
        this._balance = result.body.balance;
      }

      return this._balance >= 0 ? this._balance : 0;
    } catch (error) {
      error.internalErrorMessage = `api.store().getBalance(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Terrible approach, don't care, it works.
   * @param {*} languageId
   * @param {*} requestNew
   * @returns
   */
  async _getStore (languageId, requestNew = false) {
    if (!requestNew && this._store[languageId]) {
      return this._store[languageId];
    }

    if (requestNew) {
      await Promise.all([
        Reflect.deleteProperty(this._store, languageId),
        Reflect.deleteProperty(this._products, languageId),
        this._sectionProductIds = {}
      ]);
    }
    const result = await this._websocket.emit(Commands.TOPIC_PAGE_LAYOUT,
      {
        name: 'store',
        languageId
      }
    );

    if (result.success) {
      const processPage = async (page, type) => {
        return await page.sectionList.filter((section) => section.elementList.some((element) => element.type === 'collection')).reduce(async (result, value, index) => {
          const heading = value.elementList.find((element) => element.type === 'heading');
          const text = value.elementList.find((element) => element.type === 'text');
          const collectionData = value.elementList.find((element) => element.type === 'collection');
          try {
            const section = {
              id: collectionData.properties.recipe.id,
              title: heading ? heading.properties.text : `Unknown (${value.id})`,
              description: text.properties.text
            };

            if (heading && heading.properties.link && heading.properties.link.url && heading.properties.link.text) {
              const fullPage = await this._websocket.emit(Commands.TOPIC_PAGE_LAYOUT,
                {
                  name: heading.properties.link.url.split('/').slice(-1)[0],
                  languageId
                }
              );

              if (fullPage.success) {
                const sections = await processPage(fullPage.body, fullPage.body.title);

                if (sections.length === 1) {
                  section.id = sections[0].id;
                } else {
                  section.sections = sections;
                }
              }
            }

            if (section.sections && section.sections.length > 0) {
              Reflect.deleteProperty(section, 'id');
            }

            (await result).push(section);
          } catch (error) {
          }

          return await result;
        }, []);
      };

      const sections = await processPage(result.body);

      return sections;
    }
  }

  async getByLanguage (language, requestNew = false) {
    return {
      balance: await this.getBalance(),
      sections: await this._getStore(language, requestNew) || []
    };
  }

  async _locateSection (sectionId, sections) {
    for (const section of sections) {
      if (section.id === section) {
        return section;
      }

      if (Reflect.has(section, 'sections')) {
        return await this._locateSection(sectionId, section.sections);
      }
    }

    return null;
  }

  /**
   * Terrible approach, don't care, it works.
   * @param {*} languageId
   * @param {*} requestNew
   * @returns
   */
  async getProductsBySectionId (section, language, requestNew = false) {
    const requested = this._locateSection(section, await this._getStore(language, requestNew));

    if (!requested) {
      return new Response({ code: 404, body: undefined, headers: { message: 'no section exists for requested language' } });
    }

    const requestProductIdsIfNeeded = async (currentIdList = []) => {
      if (this._sectionProductIds[section]) {
        return this._sectionProductIds;
      }

      const result = await this._websocket.emit(Commands.TOPIC_PAGE_RECIPE_LIST,
        {
          id: section,
          type: 'product',
          offset: currentIdList.length,
          languageId: language
        }
      );

      if (result.success) {
        currentIdList.push(...result.body.map((product) => product.id));

        if (result.body.length >= 50) {
          return await requestProductIdsIfNeeded(currentIdList);
        }

        this._sectionProductIds[section] = currentIdList;
      }

      return this._sectionProductIds[section] || [];
    };

    const productIdList = await requestProductIdsIfNeeded();

    if (productIdList.length === 0) {
      return [];
    }

    let products = [];

    if (!requestNew && this._products[language]) {
      products = this._products[language].filter((product) => productIdList.includes(product.id));
    }

    if (products.length !== productIdList.length) {
      const productIdsToRequest = productIdList.filter((productId) => !products.some((product) => product.id === productId));

      for (const productIdBatch of this._api.utility().array().chunk(productIdsToRequest, this._api._botConfig.get('batch.length'))) {
        const result = await this._websocket.emit(
          Commands.STORE_PRODUCT,
          {
            body: {
              idList: productIdBatch,
              languageId: language
            }
          }
        );

        if (result.success) {
          const productResponses = Object.values(result.body).map((productResponse) => new Response(productResponse, Commands.STORE_PRODUCT));

          for (const [index, productResponse] of productResponses.entries()) {
            if (productResponse.success) {
              products.push(await this._process(productResponse.body, language));
            } else {
              products.push(
                {
                  id: productIdBatch[index],
                  exists: false
                }
              );
            }
          }
        } else {
          products.push(
            ...productIdBatch.map((id) =>
              (
                {
                  id,
                  exists: false
                }
              )
            )
          );
        }
      }
    }

    return products;
  }

  async _process (product, language) {
    product.exists = true;

    if (!this._products[language]) {
      this._products = [product];
    } else {
      this._products.push(product);
    }

    return product;
  }

  async _cleanup (disconnected) {
    if (!disconnected && this._balance >= 0) {
      return await this.getBalance(true);
    }

    this._balance = -1;
    this._store = {};
    this._products = {};
    this._sectionProductIds = {};
  }
}

module.exports = Store;

const constants = require('@dawalters1/constants');
const { request } = require('../../constants');
const Helper = require('../Helper');

const validator = require('../../validator');

/**
 * {@hideconstructor}
 */
module.exports = class Discovery extends Helper {
  constructor (api) {
    super(api);

    this._discovery = {};
    this._recipes = {};
  }

  /**
   * Retrieve the discovery elements
   * @param {Number} language - The language to request in
   * @param {Boolean} requestNew - Whether or not to request new data from the server
   */
  async get (language = constants.language.ENGLISH, requestNew = false) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (this._discovery[language] && !requestNew) {
      return this._discovery[language];
    }

    const result = await this._websocket.emit(request.TOPIC_PAGE_LAYOUT,
      {
        name: 'discover',
        languageId: language
      });

    if (result.success) {
      this._discovery[language] = result.body;
    }

    return this._discovery[language];
  }

  /**
   * Will attempt to retrieve the ID list for a section
   * @param {Number} id - The section to retrive
   * @param {Number} language - The language to request in
   * @param {Boolean} requestNew - Whether or not to request new data from the server
   * @returns Returns undefined if section does not contain a recipe
   */
  async getSectionRecipe (id, language = constants.language.ENGLISH, requestNew = false) {
    const discovery = await this.get(language, requestNew);

    const section = discovery.sectionList.find((section) => section.id === id);

    if (!section) {
      return undefined;
    }

    const collection = section.elementList.find((element) => element.type === constants.elementType.COLLECTION);

    if (!collection) {
      return undefined;
    }

    const recipe = collection.properties.recipe;
    const type = collection.properties.type === 'groupEvent' ? 'event' : collection.properties.type;

    if (this._recipes[recipe.id] && !requestNew) {
      return {
        type,
        idList: this._recipes[recipe.id].map((hash) => hash.id)
      };
    }

    const result = await this._websocket.emit(request.TOPIC_PAGE_RECIPE_LIST,
      {
        id: recipe.id,
        languageId: language,
        type,
        offset: 0,
        maxResults: recipe.max
      });

    if (result.success) {
      this._recipes[recipe.id] = result.body;

      return {
        type,
        idList: this._recipes[recipe.id].map((hash) => hash.id)
      };
    }

    return {
      type,
      idList: [],
      message: 'failed to retrieve hash list'
    };
  }

  _clearCache () {
    this._discovery = {};
  }
};

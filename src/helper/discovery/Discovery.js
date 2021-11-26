const BaseHelper = require('../BaseHelper');

const { Commands, Language } = require('../../constants');
const validator = require('../../validator');

const format = (oldDiscovery) => {
  const formattedDiscovery = {
    title: oldDiscovery.title,
    name: oldDiscovery.name,
    sections: []
  };

  for (const oldSection of oldDiscovery.sectionList) {
    const formattedSection = {
      id: oldSection.id,
      validity: oldSection.validity,
      elements: {}
    };

    for (const element of oldSection.elementList) {
      const type = element.type;
      Reflect.deleteProperty(element, 'type');

      Object.assign(element, element.properties);

      Reflect.deleteProperty(element, 'properties');

      formattedSection.elements[type] = element;
    }

    formattedDiscovery.sections.push(formattedSection);
  }

  return formattedDiscovery;
};

module.exports = class Discovery extends BaseHelper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._discovery = {};
    this._recipes = {};
  }

  async getByLanguage (language, requestNew = false) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(Language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (!validator.isValidBoolean(requestNew)) {
      throw new Error('requestNew must be a valid boolean');
    }

    if (this._discovery[language] && !requestNew) {
      return this._discovery[language];
    }

    const result = await this._websocket.emit(Commands.TOPIC_PAGE_LAYOUT,
      {
        name: 'discover',
        languageId: language
      });

    if (result.success) {
      this._discovery[language] = format(result.body);
    }

    return this._discovery[language];
  }

  async _getRecipe (id, language, type, min, max, requestNew = false) {
    if (!requestNew && this._recipes[language] && this._recipes[language][id]) {
      return {
        type,
        idList: this._recipes[language][id].map((hash) => hash.id)
      };
    }

    if (!this._recipes[language]) {
      this._recipes[language] = {};
    }

    const result = await this._websocket.emit(
      Commands.TOPIC_PAGE_RECIPE_LIST,
      {
        id,
        languageId: language,
        type,
        offset: 0,
        minResults: min,
        maxResults: max
      }
    );

    if (result.success) {
      this._recipes[language][id] = result.body;
    }

    return {
      type,
      idList: (this._recipes[language][id] || []).map((hash) => hash.id)
    };
  }

  async getRecipe (id, language, requestNew = false) {
    if (!validator.isValidNumber(id)) {
      throw new Error('id must be a valid number');
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new Error('id cannot be less than or equal to 0');
    }
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(Language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (!validator.isValidBoolean(requestNew)) {
      throw new Error('requestNew must be a valid boolean');
    }

    const sections = await this._api.utility().discovery().getRecipeSections(language, requestNew);

    const requestedSection = sections.find((section) => {
      return section.elements.collection.recipe.id === id;
    });

    if (!requestedSection) {
      throw new Error(`requested section is not a collection in language ${language}`);
    }

    const element = requestedSection.elements.collection;

    const recipe = element.recipe;
    const type = element.type === 'groupEvent' ? 'event' : element.type;

    return await this._getRecipe(recipe.id, language, type, recipe.min, recipe.max);
  }

  async getRecipeBySectionId (id, language, requestNew = false) {
    if (!validator.isValidNumber(id)) {
      throw new Error('id must be a valid number');
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new Error('id cannot be less than or equal to 0');
    }
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(Language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (!validator.isValidBoolean(requestNew)) {
      throw new Error('requestNew must be a valid boolean');
    }

    const sections = await this._api.utility().discovery().getRecipeSections(language, requestNew);

    const requestedSection = sections.find((section) => section.id === id);

    if (!requestedSection) {
      throw new Error('requested section is not a collection');
    }

    const element = requestedSection.elements.collection;

    const recipe = element.recipe;
    const type = element.type === 'groupEvent' ? 'event' : element.type;

    return await this._getRecipe(recipe.id, language, type, recipe.min, recipe.max);
  }

  async _cleanup () {
    this._discovery = {};
    this._recipes = {};
  }
};

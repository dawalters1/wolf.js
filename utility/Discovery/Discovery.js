const validator = require('../../validator');
const constants = require('@dawalters1/constants');

class Discovery {
  constructor (api) {
    this._api = api;
  }

  async getRecipeSections (language, requestNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a valid number');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is invalid');
    }

    if (!validator.isValidBoolean(requestNew)) {
      throw new Error('requestNew must be a valid boolean');
    }

    const discovery = await this._api.discovery().getByLanguage(language, requestNew);

    if (!discovery) {
      return [];
    }

    return discovery.sections.filter((section) => section.elements.collection !== undefined);
  }
}

module.exports = Discovery;

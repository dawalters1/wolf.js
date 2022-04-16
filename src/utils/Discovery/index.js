const validator = require('../../validator');
const { Language } = require('../../constants');

class Discovery {
  constructor (api) {
    this._api = api;
  }

  async getRecipeSections (language, requestNew = false) {
    try {
      if (validator.isNullOrUndefined(language)) {
        throw new Error('language cannot be null or undefined');
      } else if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (validator.isLessThanOrEqualZero(language)) {
        throw new Error('language cannot be less than or equal to 0');
      } else if (!Object.values(Language).includes(language)) {
        throw new Error('language is invalid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      const discovery = await this._api._discovery.getByLanguage(language, requestNew);

      if (!discovery) {
        return [];
      }

      return discovery.sections.filter((section) => section.elements.collection !== undefined);
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.discovery${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getRecipeSections(language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }
}

module.exports = Discovery;

const Helper = require('../Helper');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

const validator = require('../../utils/validator');

module.exports = class Notification extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);

    this._cache = {};
  }

  async list (language = constants.language.ENGLISH, requestNew = false) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (!requestNew && this._cache[language]) {
      return this._cache[language];
    }

    const result = await this._websocket.emit(request.NOTIFICATION_LIST, {
      language
    });

    if (result.success) {
      this._cache[language] = result.body;
    }

    return this._cache[language] || [];
  }

  async clear () {
    const result = await this._websocket.emit(request.NOTIFICATION_LIST_CLEAR);

    if (result.success) {
      this._cleanUp();
    }

    return result;
  }

  _cleanUp () {
    this.cache = {};
  }
};

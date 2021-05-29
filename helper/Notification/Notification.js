const Helper = require('../Helper');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

const validator = require('../../utils/validator');

module.exports = class Notification extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async list (language) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is not valid');
    }

    return await this._websocket.emit(request.NOTIFICATION_LIST, {
      language
    });
  }

  async clear () {
    return await this._websocket.emit(request.NOTIFICATION_LIST_CLEAR);
  }
};

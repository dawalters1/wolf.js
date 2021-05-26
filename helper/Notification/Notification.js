const Helper = require('../Helper');

const constants = require('../../constants');

const requests = {
  NOTIFICATION_LIST: 'notification list',
  NOTIFICATION_LIST_CLEAR: 'notification list clear'
};

const validator = require('../../utilities/validator');

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

    return await this._websocket.emit(requests.NOTIFICATION_LIST, {
      language
    });
  }

  async clear () {
    return await this._websocket.emit(requests.NOTIFICATION_LIST_CLEAR);
  }
};

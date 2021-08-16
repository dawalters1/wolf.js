const Helper = require('../Helper');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

const validator = require('@dawalters1/validator');
const internal = require('../../constants/internal');

module.exports = class Notification extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._notifications = {};
  }

  /**
   * Get notification list by Language - Use @dawalters1/constants for language
   * @param {Number} language - The language of the notifications
   * @param {Boolean} requestNew - Request new data from the server
   * @returns
   */
  async list (language = constants.language.ENGLISH, requestNew = false) {
    try {
      if (validator.isNullOrWhitespace(language)) {
        throw new Error('language cannot be null or empty');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is not valid');
      }

      if (!requestNew && this._notifications[language]) {
        return this._notifications[language];
      }

      const result = await this._websocket.emit(request.NOTIFICATION_LIST, {
        language
      });

      if (result.success) {
        this._notifications[language] = result.body;
      }

      return this._notifications[language] || [];
    } catch (error) {
      error.method = `Helper/Notification/list(language = ${JSON.stringify(language)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   *
   * Clear the notification lists
   */
  async clear () {
    try {
      const result = await this._websocket.emit(request.NOTIFICATION_LIST_CLEAR);

      if (result.success) {
        this._cleanUp();
      }

      return result;
    } catch (error) {
      error.method = 'Helper/Notification/clear()';
      throw error;
    }
  }

  async subscribeToNotifications (language = constants.language.ENGLISH) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (this._subscriptionInterval !== undefined) {
      if (this._subscriptionLanguage === language) {
        throw new Error('already subscribed to notifications');
      } else {
        this._subscriptionLanguage = language;
        return Promise.resolve();
      }
    }

    this._subscriptionLanguage = language;

    this._subscriptionInterval = setInterval(async () => {
      const cached = this._notifications[language] || [];
      const newData = await this.list(this._subscriptionLanguage, true);

      if (newData.length > 0) {
        for (const item of newData) {
          if (!cached.find((notification) => notification.id === item.id)) {
            this._api.on._emit(internal.NOTIFICATION_RECEIVED, item);
          }
        }
      }
    }, 600000);
  }

  _cleanUp () {
    this._notifications = {};

    if (this._subscriptionInterval) {
      clearInterval(this._subscriptionInterval);
    }
  }
};

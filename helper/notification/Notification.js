const Helper = require('../Helper');
const validator = require('../../validator');

const request = require('../../constants/request');
const constants = require('@dawalters1/constants');
const internal = require('../../constants/internal');

/**
 * {@hideconstructor}
 */
module.exports = class Notification extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._notifications = {};

    this._subscriptions = {};
  }

  /**
   * Get notification list by Language - Use @dawalters1/constants for language
   * @param {Number} language - The language of the notifications
   * @param {Boolean} requestNew - Request new data from the server
   * @returns
   */
  async list (language = constants.language.ENGLISH, requestNew = false) {
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
  }

  /**
   *
   * Clear the notification lists
   */
  async clear () {
    const result = await this._websocket.emit(request.NOTIFICATION_LIST_CLEAR);

    if (result.success) {
      this._clearCache();
    }

    return result;
  }

  /**
   * Subscibe to notificiations (will be checked every 10 minutes)
   * @param {Number} language - The language of the notifications
   * @returns
   */
  async subscribe (language = constants.language.ENGLISH) {
    if (validator.isNullOrWhitespace(language)) {
      throw new Error('language cannot be null or empty');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is not valid');
    }

    if (this._subscriptions[language] !== undefined) {
      throw new Error(`already subscribed to ${language} notifications`);
    }

    this._subscriptions[language] = setInterval(async () => {
      const cached = this._notifications[language] || [];
      const newData = await this.list(language, true);

      if (newData.length > 0) {
        for (const notification of newData) {
          if (!cached.find((notif) => notif.id === notification.id)) {
            this._api.on._emit(internal.NOTIFICATION_RECEIVED,
              {
                language,
                notification
              });
          }
        }
      }
    }, 600000);
  }

  _clearCache () {
    this._notifications = {};

    for (const language of Object.keys(this._subscriptions)) {
      clearInterval(this._subscriptions[language]);
    }

    this._subscriptions = {};
  }
};

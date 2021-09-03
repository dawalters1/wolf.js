const Helper = require('../Helper');
const validator = require('../../utils/validator');

const request = require('../../constants/request');
const constants = require('@dawalters1/constants');
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
   * @deprecated Will be removed in 1.0.0 use subscribe(language) instead
   */
  async subscribeToNotifications (language = constants.language.ENGLISH) {
    console.warn('subscribeToNotifications(language) is deprecated and will be removed in 1.0.0 use subscribe(language) instead');
    return await this.subscribe(language);
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

  _clearCache () {
    this._notifications = {};

    if (this._subscriptionInterval) {
      clearInterval(this._subscriptionInterval);
    }
  }
};

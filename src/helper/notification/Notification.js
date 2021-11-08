const BaseHelper = require('../BaseHelper');

const constants = require('@dawalters1/constants');
const validator = require('../../validator');
const { request, internal } = require('../../constants');

class Notification extends BaseHelper {
  constructor (api) {
    super(api);

    this._notifications = {};
    this._subscriptions = {};
  }

  async list (language, requestNew = false) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._notifications[language]) {
        return this._notifications[language];
      }

      const result = await this._websocket.emit(
        request.NOTIFICATION_LIST,
        {
          language
        }
      );

      if (result.success) {
        this._notifications[language] = result.body;
      }

      return this._notifications[language] || [];
    } catch (error) {
      error.internalErrorMessage = `api.notification().list(language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async clear () {
    try {
      const result = await this._websocket.emit(request.NOTIFICATION_LIST_CLEAR);

      if (result.success) {
        this._notifications = {};
      }

      return result;
    } catch (error) {
      error.internalErrorMessage = 'api.notification().clear()';
      throw error;
    }
  }

  async subscribe (language) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
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
              this._api.emit(
                internal.NOTIFICATION_RECEIVED,
                {
                  language,
                  notification
                }
              );
            }
          }
        }
      }, this._api.config.notificationSettings.duration || this._api._botConfig.notificationSettings.duration);
    } catch (error) {
      error.internalErrorMessage = `api.notification().subscribe(language=${JSON.stringify(language)})`;
      throw error;
    }
  }

  async unsubscribe (language) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is not valid');
      }

      Reflect.deleteProperty(this._subscriptions, language);

      return Promise.resolve();
    } catch (error) {
      error.internalErrorMessage = `api.notification().unsubscribe(language=${JSON.stringify(language)})`;
      throw error;
    }
  }

  _cleanup () {
    this._notifications = {};

    for (const language of Object.keys(this._subscriptions)) {
      clearInterval(this._subscriptions[language]);
    }

    this._subscriptions = {};
  }
};

module.exports = Notification;

const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const { Commands, Language } = require('../../constants');

class Notification extends BaseHelper {
  constructor (api) {
    super(api);

    this._notifications = [];
    this._fetchedNotifications = false;
  }

  async list (language, requestNew = false) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(Language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._language && this._language === language && this._fetchedNotifications) {
        return this._notifications;
      }
      const result = await this._websocket.emit(
        Commands.NOTIFICATION_LIST,
        {
          language
        }
      );

      if (result.success) {
        this._language = language;
        this._fetchedNotifications = true;
        this._notifications = result.body;
      }

      return this._notifications;
    } catch (error) {
      error.internalErrorMessage = `api.notification().list(language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async clear () {
    try {
      const result = await this._websocket.emit(Commands.NOTIFICATION_LIST_CLEAR);

      if (result.success) {
        this._fetchedNotifications = false;
        this._notifications = [];
      }

      return result;
    } catch (error) {
      error.internalErrorMessage = 'api.notification().clear()';
      throw error;
    }
  }

  async subscribe (language) {
    console.log('Notification subscriptions are now deprecated and will no longer work');
  }

  async unsubscribe (language) {
    console.log('Notification subscriptions are now deprecated and will no longer work');
  }

  async _cleanup (disconnected) {
    if (!disconnected && this._fetchedNotifications) {
      return await this.list(this._language, true);
    }

    this._language = undefined;
    this._fetchedNotifications = false;
    this._notifications = [];
  }
};

module.exports = Notification;

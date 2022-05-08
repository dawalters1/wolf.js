const { Command } = require('../../constants');
const Base = require('../Base');
const models = require('../../models');
const { NOTIFICATION_LIST_CLEAR } = require('../../constants/Command');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class Notification extends Base {
  constructor (client) {
    super(client);

    this.notifications = [];
  }

  async list (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', forceNew);
    }

    if (!forceNew && this._notifications.length) {
      return this._notifications;
    }

    const response = await this.client.websocket.emit(
      Command.NOTIFICATION_LIST,
      {
        language: this.client.options.language.code
      }
    );

    return response.success ? response.body.map((notification) => this._process(new models.Notification(this.client, notification))) : [];
  }

  async clear () {
    return await this.client.websocket.emit(NOTIFICATION_LIST_CLEAR);
  }

  _process (value) {
    const existing = this.notifications.find((group) => group.id === value);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.notifications.push(value);
    }

    return value;
  }
}

module.exports = Notification;

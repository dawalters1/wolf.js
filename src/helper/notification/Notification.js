import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import patch from '../../utils/patch.js';

class Notification extends Base {
  constructor (client) {
    super(client);

    this.notifications = [];
  }

  async list (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.notifications.length) {
      return this.notifications;
    }

    const response = await this.client.websocket.emit(
      Command.NOTIFICATION_LIST,
      {
        language: this.client.config.framework.language
      }
    );

    return response.body?.map((notification) => this._process(new models.Notification(this.client, notification))) ?? [];
  }

  async clear () {
    return await this.client.websocket.emit(Command.NOTIFICATION_LIST_CLEAR);
  }

  _process (value) {
    const existing = this.notifications.find((group) => group.id === value);

    existing ? patch(existing, value) : this.notifications.push(value);

    return value;
  }
}

export default Notification;

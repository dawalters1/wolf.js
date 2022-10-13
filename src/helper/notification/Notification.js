import Command from '../../constants/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import { NOTIFICATION_LIST_CLEAR } from '../../constants/Command.js';
import validator from '../../validator/index.js';

class Notification extends Base {
  async list (forceNew = false) {
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
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
    const existing = this.cache.find((group) => group.id === value);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.cache.push(value);
    }

    return value;
  }
}

export default Notification;

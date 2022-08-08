import { Command } from '../../constants/index.js';
import { Base } from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscription extends Base {
  async getList () {
    if (this.cache.length) {
      return this.cache;
    }

    const response = await this.client.websocket.emit(Command.SUBSCRIBER_GROUP_EVENT_LIST, {
      subscribe: true
    });

    this.cache = response.body ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];

    return this.cache;
  }

  async add (eventId) {
    if (validator.isNullOrUndefined(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
    }

    return await this.client.websocket.emit(Command.SUBSCRIBER_GROUP_EVENT_ADD, {
      id: parseInt(eventId)
    });
  }

  async remove (eventId) {
    if (validator.isNullOrUndefined(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
    }

    return await this.client.websocket.emit(Command.SUBSCRIBER_GROUP_EVENT_DELETE, {
      id: parseInt(eventId)
    });
  }
}

export { Subscription };

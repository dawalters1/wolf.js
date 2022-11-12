import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscription extends Base {
  constructor (client) {
    super(client);

    this.subscriptions = [];
  }

  async getList (subscribe = true) {
    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (this.subscriptions.length) {
      return this.subscriptions;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        subscribe
      }
    );

    this.subscriptions = response.body ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];

    return this.subscriptions;
  }

  async add (eventId) {
    if (validator.isNullOrUndefined(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_ADD,
      {
        id: parseInt(eventId)
      }
    );
  }

  async remove (eventId) {
    if (validator.isNullOrUndefined(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_DELETE,
      {
        id: parseInt(eventId)
      }
    );
  }
}

export default Subscription;

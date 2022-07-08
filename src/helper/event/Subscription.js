const { Command } = require('../../constants');
const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
// const { Command } = require('../../constants');

// const models = require('../../models');

class Subscription extends Base {
  async getSubscriptionList () {
    if (this.cache.length) {
      return this.cache;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        subscribe: true
      }
    );

    this.cache = response.body ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];

    return this.cache;
  }

  async add (eventId) {
    if (validator.isNullOrUndefined(eventId)) {
      throw new WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
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
      throw new WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(eventId)) {
      throw new WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
    }
    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_DELETE,
      {
        id: parseInt(eventId)
      }
    );
  }
}

module.exports = Subscription;

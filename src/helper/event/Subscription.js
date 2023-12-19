import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscription extends Base {
  constructor (client) {
    super(client);

    this._fetched = false;
    this.subscriptions = new Map();
  }

  /**
   * Get list of Bots event subscriptions
   * @param {Boolean} subscribe
   * @returns {Promise<Array<Event>>}
   */
  async getList (subscribe = true) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidBoolean(subscribe)) {
        throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
      }
    }

    if (this._fetched) {
      return this.subscriptions.values();
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        subscribe
      }
    );

    this._fetched = response.success;

    if (!response.success || !response.body.length) {
      return [];
    }

    (
      await this.client.event.getByIds(
        response.body
          .map((event) => event.id)
      )
    )
      .map((event) =>
        this.subscriptions.set(event.id, event)
      );

    return this.subscriptions.values();
  }

  /**
   * Add an event to the bots event subscription list
   * @param {Number} eventId
   * @returns {Promise<Response>}
   */
  async add (eventId) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
      } else if (!validator.isValidNumber(eventId)) {
        throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_ADD,
      {
        id: parseInt(eventId)
      }
    );
  }

  /**
   * Remove an event from the bots event subscription list
   * @param {Number} eventId
   * @returns {Promise<Response>}
   */
  async remove (eventId) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
      } else if (!validator.isValidNumber(eventId)) {
        throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
      }
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_GROUP_EVENT_DELETE,
      {
        id: parseInt(eventId)
      }
    );
  }

  _cleanUp (reconnection = false) {
    this.subscriptions.clear();
  }
}

export default Subscription;

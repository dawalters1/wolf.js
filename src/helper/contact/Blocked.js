import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';

class Blocked extends Base {
  constructor (client) {
    super(client);

    this.blocked = [];
  }

  /**
   * Get the Bots blocked list
   * @param {Boolean} subscribe
   * @returns {Promise<Array<Contact>>}
   */
  async list (subscribe = true) {
    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (this.blocked.length) {
      return this.blocked;
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_LIST,
      {
        subscribe
      }
    );

    this.blocked = response.body?.map((contact) => new models.Contact(this.client, contact)) ?? [];

    return this.blocked;
  }

  /**
   * Check whether or not a subscriber is blocked
   * @param {Number | Number[]} subscriberIds
   * @returns {Promise<boolean | Array<boolean>>}
   */
  async isBlocked (subscriberIds) {
    const values = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!values.length) {
      throw new models.WOLFAPIError('subscriberIds cannot be null or empty', { subscriberIds });
    }

    if ([...new Set(values)].length !== values.length) {
      throw new models.WOLFAPIError('values cannot contain duplicates', { subscriberIds });
    }

    for (const subscriberId of values) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    const blockedIds = (await this.list())
      .map((blocked) => blocked.id);

    const results = values.map((subscriberId) => blockedIds.includes(subscriberId));

    return Array.isArray(subscriberIds) ? results : results[0];
  }

  /**
   * Block a subscriber
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async block (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_ADD,
      {
        id: parseInt(subscriberId)
      }
    );
  }

  /**
   * Unblock a subscriber
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async unblock (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_BLOCK_DELETE,
      {
        id: parseInt(subscriberId)
      }
    );
  }

  _cleanUp (reconnection = false) {
    this.blocked = [];
  }
}

export default Blocked;

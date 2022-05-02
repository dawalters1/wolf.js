const { Commands } = require('../../constants');
const Base = require('../Base');

const models = require('../../models');

const validator = require('../../validator');

/**
 * TODO: Paramater validation
 */
class Blocked extends Base {
  constructor (client) {
    super(client);

    this._blocked = [];
  }

  async list () {
    if (this._blocked.length) {
      return this._blocked;
    }

    const response = await this.client.websocket.emit(
      Commands.SUBSCRIBER_BLOCK_LIST,
      {
        subscribe: true
      }
    );

    if (response.success) {
      this._blocked = response.body.map((contact) => new models.Contact(this.client, contact));
    }

    return this._blocked;
  }

  async isBlocked (subscriberIds) {
    subscriberIds = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!subscriberIds.length) {
      throw new Error('subscriberIds cannot be null or empty');
    }

    if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
      throw new Error('subscriberIds cannot contain duplicates');
    }

    for (const subscriberId of subscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }
    }

    await this.list();

    const results = subscriberIds.reduce((result, subscriberId) => {
      result.push(this._blocked.find((contact) => contact.id === subscriberId));

      return result;
    }, []);

    return Array.isArray(subscriberIds) ? results : results[0];
  }

  async block (subscriberId) {
    return await this.client.websocket.emit(
      Commands.SUBSCRIBER_BLOCK_ADD,
      {
        id: subscriberId
      }
    );
  }

  async unblock (subscriberId) {
    return await this.client.websocket.emit(
      Commands.SUBSCRIBER_BLOCK_DELETE,
      {
        id: subscriberId
      }
    );
  }
}

module.exports = Blocked;

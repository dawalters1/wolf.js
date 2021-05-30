const Helper = require('../Helper');

const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

module.exports = class Blocked extends Helper {
  constructor (bot) {
    super(bot);

    this._cache = [];
  }

  async list () {
    if (this._cache.length > 0) {
      return this._cache;
    }

    const result = await this._websocket.emit(request.SUBSCRIBER_BLOCK_LIST,
      {
        subscribe: true
      });

    if (result.success) {
      this._cache = result.body;
    }

    return this._cache || [];
  }

  async isBlocked (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return (await this.list()).find((blocked) => blocked.id === subscriberId) !== null;
  }

  async block (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_BLOCK_ADD, {
      id: subscriberId
    });
  }

  async unblock (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_BLOCK_DELETE, {
      id: subscriberId
    });
  }

  async _process (id) {
    const existing = this._cache.find((blocked) => blocked.id === id);

    if (existing) {
      this._cache = this._cache.filter((blocked) => blocked.id !== id);

      return existing;
    } else {
      const subscriber = await this._bot.subscriber().getById(id);

      const blocked = {
        id,
        additionalInfo: {
          hash: subscriber.hash,
          nickname: subscriber.nickname,
          onlineState: subscriber.onlineState,
          privileges: subscriber.privileges
        }
      };

      this._cache.push(blocked);

      return blocked;
    }
  }

  async _patch (subscriber) {
    const existing = this._cache.find((contact) => contact.id === subscriber.id);

    if (existing) {
      for (const key in subscriber) {
        existing[key] = subscriber[key];
      }
    }

    return existing;
  }
};

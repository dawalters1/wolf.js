const Helper = require('../Helper');

const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

module.exports = class Blocked extends Helper {
  constructor (bot) {
    super(bot);

    this._blocked = [];
  }

  async list () {
    if (this._blocked.length > 0) {
      return this._blocked;
    }

    const result = await this._websocket.emit(request.SUBSCRIBER_BLOCK_LIST,
      {
        subscribe: true
      });

    if (result.success) {
      this._blocked = result.body;
    }

    return this._blocked || [];
  }

  async isBlocked (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return (await this.list()).find((blocked) => blocked.id === subscriberId) !== null;
    } catch (error) {
      error.method = `Helper/Blocked/isBlocked(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async block (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.SUBSCRIBER_BLOCK_ADD, {
        id: subscriberId
      });
    } catch (error) {
      error.method = `Helper/Blocked/block(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async unblock (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.SUBSCRIBER_BLOCK_DELETE, {
        id: subscriberId
      });
    } catch (error) {
      error.method = `Helper/Blocked/unblock(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async _process (id) {
    const existing = this._blocked.find((blocked) => blocked.id === id);

    if (existing) {
      this._blocked = this._blocked.filter((blocked) => blocked.id !== id);

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

      this._blocked.push(blocked);

      return blocked;
    }
  }

  async _patch (subscriber) {
    const existing = this._blocked.find((contact) => contact.id === subscriber.id);

    if (existing) {
      for (const key in subscriber) {
        existing[key] = subscriber[key];
      }
    }

    return existing;
  }

  _cleanUp () {
    this._blocked = [];
  }
};

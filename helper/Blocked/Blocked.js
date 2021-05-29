const Helper = require('../Helper');

const validator = require('../../utils/validator');
const request = require('../../constants/request');

module.exports = class Blocked extends Helper {
  constructor (bot) {
    super(bot);

    this._cache = [];
  }

  async list () {
    return await new Promise((resolve, reject) => {
      if (this._cache.length > 0) {
        resolve(this._cache);
      };

      this._websocket.emit(request.SUBSCRIBER_BLOCK_LIST,
        {
          subscribe: true
        }).then((result) => {
        if (result.success) {
          this._cache = result.body;
        }

        resolve(this._cache);
      });
    });
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
};

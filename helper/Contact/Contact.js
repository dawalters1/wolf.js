const Helper = require('../Helper');

const validator = require('../../utils/validator');
const request = require('../../constants/request');

module.exports = class Contact extends Helper {
  constructor (bot) {
    super(bot);

    this._cache = [];
  }

  async list () {
    return await new Promise((resolve, reject) => {
      if (this._cache.length > 0) {
        resolve(this._cache);
      };

      this._websocket.emit(request.SUBSCRIBER_CONTACT_LIST,
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

  async isContact (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return (await this.list()).find((contact) => contact.id === subscriberId) !== null;
  }

  async add (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_CONTACT_ADD, {
      id: subscriberId
    });
  }

  async delete (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_CONTACT_DELETE, {
      id: subscriberId
    });
  }

  async _process (id) {
    const existing = this._cache.find((contact) => contact.id === id);

    if (existing) {
      this._cache = this._cache.filter((contact) => contact.id !== id);

      return existing;
    } else {
      const subscriber = await this._bot.subscriber().getById(id);

      const contact = {
        id,
        additionalInfo: {
          hash: subscriber.hash,
          nickname: subscriber.nickname,
          onlineState: subscriber.onlineState,
          privileges: subscriber.privileges
        }
      };

      this._cache.push(contact);

      return contact;
    }
  }

  async patch (subscriber) {
    const existing = this._cache.find((contact) => contact.id === subscriber.id);

    if (existing) {
      for (const key in subscriber) {
        existing[key] = subscriber[key];
      }
    }

    return existing;
  }
};

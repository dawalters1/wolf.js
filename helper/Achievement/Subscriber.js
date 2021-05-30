const request = require('../../constants/request');
const Helper = require('../Helper');
const validator = require('@dawalters1/validator');

module.exports = class Subscriber extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async getById (sourceSubscriberId) {
    if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new Error('sourceSubscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new Error('sourceSubscriberId cannot be less than or equal to 0');
    }

    const result = await this._websocket.emit(request.ACHIEVEMENT_SUBSCRIBER_LIST, {
      headers: {
        version: 2
      },
      body: {
        id: sourceSubscriberId
      }
    });

    return result.success ? result.body : [];
  }
};

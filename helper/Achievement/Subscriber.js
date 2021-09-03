const Helper = require('../Helper');
const validator = require('../../utils/validator');

const request = require('../../constants/request');

module.exports = class Subscriber extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);
  }

  /**
   * Get achievements for a subscriber
   * @param {Number} sourceSubscriberId - The id of the subscriber
   */
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

const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const { request } = require('../../constants');

class Subscriber extends BaseHelper {
  async getById (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      const result = await this._websocket.emit(request.ACHIEVEMENT_SUBSCRIBER_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: subscriberId
          }
        });

      return result.success ? result.body : [];
    } catch (error) {
      error.internalErrorMessage = `api.achievement().subscriber().getById(targetGroupId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }
}

module.exports = Subscriber;

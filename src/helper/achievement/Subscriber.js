const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const { Commands } = require('../../constants');

class Subscriber extends BaseHelper {
  async getById (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (!validator.isType(subscriberId, 'number')) {
        throw new Error('subscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      const result = await this._websocket.emit(Commands.ACHIEVEMENT_SUBSCRIBER_LIST,
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
      error.internalErrorMessage = `api.achivement${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscriber${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getById(targetGroupId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }
}

module.exports = Subscriber;

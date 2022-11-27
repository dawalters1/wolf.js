const BaseHelper = require('../BaseHelper');
const { Commands } = require('../../constants');
const Response = require('../../models/ResponseObject');
const _ = require('lodash');
const validator = require('../../validator');

class Wolfstar extends BaseHelper {
  async getById (id) {
    try {
      if (validator.isNullOrUndefined(id)) {
        throw new Error('id cannot be null or undefined');
      } else if (!validator.isValidNumber(id)) {
        throw new Error('id must be a valid number');
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new Error('id cannot be less than or equal to 0');
      }

      return (await this.getByIds([id]))[0];
    } catch (error) {
      error.internalErrorMessage = `api.subscriber().wolfstar().getById(id=${JSON.stringify(id)})`;
    }
  }

  async getByIds (subscriberIds) {
    try {
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

      const wolfstars = [];

      for (const idList of _.chunk(subscriberIds, this._api._botConfig.get('batch.length'))) {
        const response = await this._websocket.emit(
          Commands.WOLFSTAR_PROFILE,
          {
            headers: {
              version: 2
            },
            body: {
              idList
            }
          }
        );

        if (response.success) {
          const wolfstarResponses = Object.values(response.body).map((wolfstarResponse) => new Response(wolfstarResponse));

          for (const [index, wolfstarResponse] of wolfstarResponses.entries()) {
            wolfstars.push(wolfstarResponse.success ? { ...wolfstarResponse.body, exists: true } : { subscriberId: idList[index], exists: false });
          }
        } else {
          wolfstars.push(...idList.map((subscriberId) => ({ subscriberId, exists: false })));
        }
      }

      return wolfstars;
    } catch (error) {
      error.internalErrorMessage = `api.subscriber().wolfstar().getByIds(subscriberIds=${JSON.stringify(subscriberIds)})`;
    }
  }
}

module.exports = Wolfstar;

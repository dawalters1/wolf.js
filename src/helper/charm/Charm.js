const BaseHelper = require('../BaseHelper');
const validator = require('../../validator');
const { request } = require('../../constants');
const constants = require('@dawalters1/constants');

class Charm extends BaseHelper {
  constructor (api) {
    super(api);

    this._charms = {};
  }

  async list (language, requestNew = false) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._charms[language]) {
        return this._charms[language];
      }

      const result = await this._websocket.emit(
        request.CHARM_LIST,
        {
          language
        }
      );

      if (result.success) {
        this._charms[language] = result.body.map((charm) => {
          charm.exists = true;
          return charm;
        });
      }

      return this._charms[language] || [];
    } catch (error) {
      error.internalErrorMessage = `api.charm().list(language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getById (charmId, language, requestNew = false) {
    return (await this.getByIds(charmId, language, requestNew))[0];
  }

  async getByIds (charmIds, language, requestNew = false) {
    try {
      charmIds = Array.isArray(charmIds) ? [...new Set(charmIds)] : [charmIds];

      if (charmIds.length === 0) {
        throw new Error('charmIds cannot be an empty array');
      }
      for (const charmId of charmIds) {
        if (validator.isNullOrUndefined(charmId)) {
          throw new Error('charmId cannot be null or undefined');
        } else if (validator.isValidNumber(charmId)) {
          throw new Error('charmId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(charmId)) {
          throw new Error('charmId cannot be less than or equal to 0');
        }
      }
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      const charmList = await this.list(language, requestNew);

      return charmIds.reduce((result, value) => {
        if (charmList.some((charm) => charm.id === value)) {
          result.push(value);
        } else {
          result.push(
            {
              id: value,
              exists: false
            }
          );
        }

        return result;
      }, []);
    } catch (error) {
      error.internalErrorMessage = `api.charm().getByIds(charmIds=${JSON.stringify(charmIds)}, language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getSubscriberSummary (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        request.CHARM_SUBSCRIBER_SUMMARY_LIST,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.charm().getSubscriberSummary(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async getSubscriberStatistics (subscriberId) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        request.CHARM_SUBSCRIBER_STATISTICS,
        {
          id: subscriberId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.charm().getSubscriberStatistics(subscriberId=${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(
        request.CHARM_SUBSCRIBER_ACTIVE_LIST,
        {
          id: subscriberId,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.charm().getSubscriberActiveList(subscriberId=${JSON.stringify(subscriberId)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
    try {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new Error('subscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(
        request.CHARM_SUBSCRIBER_EXPIRED_LIST,
        {
          id: subscriberId,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.charm().getSubscriberExpiredList(subscriberId=${JSON.stringify(subscriberId)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async delete (charmIds) {
    try {
      charmIds = Array.isArray(charmIds) ? [...new Set(charmIds)] : [charmIds];

      if (charmIds.length === 0) {
        throw new Error('charmIds cannot be an empty array');
      }
      for (const charmId of charmIds) {
        if (validator.isNullOrUndefined(charmId)) {
          throw new Error('charmId cannot be null or undefined');
        } else if (validator.isValidNumber(charmId)) {
          throw new Error('charmId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(charmId)) {
          throw new Error('charmId cannot be less than or equal to 0');
        }
      }
      const results = [];
      for (const charmIdBatch of this._api.utility().array().chunk(charmIds, this._api.botConfig.batch.length)) {
        results.push(await this._websocket.emit(
          request.CHARM_SUBSCRIBER_DELETE,
          {
            idList: charmIdBatch
          }
        ));
      }

      return results.length === 1
        ? results[0]
        : {
            code: 207,
            body: results
          };
    } catch (error) {
      error.internalErrorMessage = `api.charm().delete(charmIds=${JSON.stringify(charmIds)})`;
      throw error;
    }
  }

  async set (charms) {
    try {
      charms = Array.isArray(charms) ? charms : [charms];

      for (const charm of charms) {
        if (validator.isNullOrUndefined(charm)) {
          throw new Error('charm cannot be null or undefined');
        }

        if (!Reflect.has(charm, 'position')) {
          throw new Error('charm must have property position');
        } else if (validator.isNullOrUndefined(charm.position)) {
          throw new Error('position cannot be null or undefined');
        } else if (validator.isValidNumber(charm.position)) {
          throw new Error('position must be a valid number');
        } else if (validator.isLessThanZero(charm.position)) {
          throw new Error('position cannot be less than 0');
        }

        if (!Reflect.has(charm, 'id')) {
          throw new Error('charm must have property id');
        } else if (validator.isNullOrUndefined(charm.id)) {
          throw new Error('id cannot be null or undefined');
        } else if (validator.isValidNumber(charm.id)) {
          throw new Error('id must be a valid number');
        } else if (validator.isLessThanOrEqualZero(charm.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }
      }

      return await this.websocket.emit(
        request.CHARM_SUBSCRIBER_SET_SELECTED,
        {
          selectedList: charms
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.charm().set(charms=${JSON.stringify(charms)})`;
      throw error;
    }
  }

  _cleanup () {
    this._charms = {};
  }
}

module.exports = Charm;

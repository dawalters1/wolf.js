const Helper = require('../Helper');

const validator = require('@dawalters1/validator');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

module.exports = class Charm extends Helper {
  constructor (bot) {
    super(bot);
    this._charms = {};
  }

  async _getCharmList (language, requestNew = false) {
    if (!requestNew && this._charms[language]) {
      return this._charms[language];
    }

    const result = await this._websocket.emit(request.CHARM_LIST,
      {
        language
      });

    if (result.success) {
      this._charms[language] = result.body;
    }

    return this._charms[language] || [];
  }

  async list (language = constants.language.ENGLISH, requestNew = false) {
    try {
      return await this._getCharmList(language, requestNew);
    } catch (error) {
      error.method = `Helper/Charm/list(language = ${JSON.stringify(language)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getById (charmId, language = constants.language.ENGLISH, requestNew = false) {
    try {
      if (!validator.isValidNumber(charmId)) {
        throw new Error('charmId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(charmId)) {
        throw new Error('charmId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is invalid');
      }

      return (await this._getCharmList(language, requestNew)).find((charm) => charm.id === charmId);
    } catch (error) {
      error.method = `Helper/Charm/getById(charmId = ${JSON.stringify(charmId)}, language = ${JSON.stringify(language)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getByIds (charmIds, language = constants.language.ENGLISH, requestNew = false) {
    try {
      if (!validator.isValidArray(charmIds)) {
        throw new Error('charmIds must be an array');
      } else if (charmIds.length === 0) {
        throw new Error('charmIds cannot be an empty array');
      }

      for (const charmId of charmIds) {
        if (!validator.isValidNumber(charmId)) {
          throw new Error('charmId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(charmId)) {
          throw new Error('charmId cannot be less than or equal to 0');
        }
      }

      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is invalid');
      }

      return (await this._getCharmList(language, requestNew)).filter((charm) => charmIds.includes(charm.id));
    } catch (error) {
      error.method = `Helper/Charm/getByIds(charmIds = ${JSON.stringify(charmIds)}, language = ${JSON.stringify(language)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getSubscriberStatistics (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.CHARM_SUBSCRIBER_STATISTICS, {
        id: subscriberId
      });
    } catch (error) {
      error.method = `Helper/Charm/getSubscriberStatistics(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(request.CHARM_SUBSCRIBER_ACTIVE_LIST, {
        id: subscriberId,
        limit,
        offset
      });
    } catch (error) {
      error.method = `Helper/Charm/getSubscriberActiveList(subscriberId = ${JSON.stringify(subscriberId)}, limit = ${JSON.stringify(limit)}, offset = ${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(request.CHARM_SUBSCRIBER_EXPIRED_LIST, {
        id: subscriberId,
        limit,
        offset
      });
    } catch (error) {
      error.method = `Helper/Charm/getSubscriberExpiredList(subscriberId = ${JSON.stringify(subscriberId)}, limit = ${JSON.stringify(limit)}, offset = ${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getSubscriberCharmSummary (subscriberId) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.CHARM_SUBSCRIBER_SUMMARY_LIST, {
        id: subscriberId
      });
    } catch (error) {
      error.method = `Helper/Charm/getSubscriberCharmSummary(subscriberId = ${JSON.stringify(subscriberId)})`;
      throw error;
    }
  }

  _cleanUp () {
    this._charms = {};
  }
};

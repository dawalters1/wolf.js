const Helper = require('../Helper');

const validator = require('../../utils/validator');
const { ENGLISH } = require('../../constants/language');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

module.exports = class Charm extends Helper {
  constructor (bot) {
    super(bot);
    this._cachedLanguage = null;
    this._cache = [];
  }

  async _getCharmList (language, requestNew = false) {
    return new Promise((resolve, reject) => {
      if (!requestNew && this._cache.length > 0) {
        resolve(this._cache);
      }

      this._websocket.emit(request.CHARM_LIST,
        {
          language
        }).then((result) => {
        if (result.success) {
          this._cachedLanguage = language;
          this._cache = result.body;
        }

        resolve(this._cache);
      });
    });
  }

  async getById (charmId, language = ENGLISH, requestNew = false) {
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
  }

  async getByIds (charmIds, language = ENGLISH, requestNew = false) {
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
  }

  async getSubscriberStatistics (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.CHARM_SUBSCRIBER_STATISTICS, {
      id: subscriberId
    });
  }

  async getSubscriberActiveList (subscriberId, limit = 25, offset = 0) {
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
  }

  async getSubscriberExpiredList (subscriberId, limit = 25, offset = 0) {
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
  }

  async getSubscriberCharmSummary (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.CHARM_SUBSCRIBER_SUMMARY_LIST, {
      id: subscriberId
    });
  }
};

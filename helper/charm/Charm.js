const Helper = require('../Helper');
const validator = require('../../validator');

const request = require('../../constants/request');
const constants = require('@dawalters1/constants');

/**
 * {@hideconstructor}
 */
module.exports = class Charm extends Helper {
  constructor (api) {
    super(api);
    this._charms = {};
  }

  /** @private */
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

  /**
   * Request the list of charms by language - Use @dawalters1/constants for language
   * @param {Number} language - The language of the charms
   * @param {Boolean} requestNew - Request new data from the server
   */
  async list (language = constants.language.ENGLISH, requestNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a valid number');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is invalid');
    }

    return await this._getCharmList(language, requestNew);
  }

  /**
   * Request a charm by ID and Language - Use @dawalters1/constants for language
   * @param {Number} charmId - The id of the charm
   * @param {Number} language - The language of the charm
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getById (charmId, language = constants.language.ENGLISH, requestNew = false) {
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

  /**
   * Request a charms by ID and Language - Use @dawalters1/constants for language
   * @param {[Number]} charmIds - The ids of the charms
   * @param {Number} language - The language of the charms
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByIds (charmIds, language = constants.language.ENGLISH, requestNew = false) {
    charmIds = Array.isArray(charmIds) ? charmIds : [charmIds];

    if (charmIds.length === 0) {
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

  /**
   * Get charm gift information for a subscriber
   * @param {Number} subscriberId - The id of the subscriber
   */
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

  /**
   * Get a list of active charms for a subscriber
   * @param {Number} subscriberId - The id of the subscriber
   * @param {Number} limit - How many charms should be returned
   * @param {Number} offset - Index where the returned charms should start
   */
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

  /**
   * Get a list of expired charms for a subscriber
   * @param {Number} subscriberId - The id of the subscriber
   * @param {Number} limit - How many charms should be returned
   * @param {Number} offset - Index where the returned charms should start
   */
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

  /**
   * Get a list of charms and how many of each a subscriber has
   * @param {Number} subscriberId - The id of the subscriber
   */
  async getSubscriberSummary (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.CHARM_SUBSCRIBER_SUMMARY_LIST, {
      id: subscriberId
    });
  }

  _clearCache () {
    this._charms = {};
  }
};

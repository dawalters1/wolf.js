const Helper = require('../Helper');
const validator = require('../../utils/validator');

const Response = require('../../networking/Response');
const Group = require('./Group');
const Subscriber = require('./Subscriber');

const constants = require('@dawalters1/constants');
const request = require('../../constants/request');

module.exports = class Achievement extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._categories = {};
    this._achievements = {};

    this._group = new Group(api);
    this._subscriber = new Subscriber(api);
  }

  /**
   * Exposed the group achievement methods
   */
  group () {
    return this._group;
  }

  /**
   * Exposed the subscriber achievement methods
   */
  subscriber () {
    return this._subscriber;
  }

  /**
   * Get achievement categories by language - Use @dawalters1/constants for language
   * @param {Number} language - Language of the category list
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getCategoryList (language = constants.language.ENGLISH, requestNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a valid number');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is invalid');
    }

    if (!requestNew && this._categories[language]) {
      return this._categories[language];
    }

    const result = await this._websocket.emit(request.ACHIEVEMENT_CATEGORY_LIST, {
      languageId: language
    });

    if (result.success) {
      this._categories[language] = result.body;
    }

    return this._categories[language] || [];
  }

  /**
   * Get achievements from their ID and Language - Use @dawalters1/constants for language
   * @param {[Number]} achievementIds - The ids of the achievements
   * @param {Number} language - Language of the achievement
   * @param {Boolean} requestNew - Request new data from the server
   * @deprecated Will be removed in 1.0.0 use getByIds(subscriber, language, requestNew) instead
   */

  async getAchievementByIds (achievementIds, language = constants.language.ENGLISH, requestNew = false) {
    console.warn('getAchievementByIds(subscriber, language, requestNew) is deprecated and will be removed in 1.0.0 use getByIds(subscriber, language, requestNew) instead');
    return this.getByIds(achievementIds, language, requestNew);
  }

  /**
   * Get achievements from their ID and Language - Use @dawalters1/constants for language
   * @param {[Number]} achievementIds - The ids of the achievements
   * @param {Number} language - Language of the achievement
   * @param {Boolean} requestNew - Request new data from the server
   * @returns
   */
  async getByIds (achievementIds, language = constants.language.ENGLISH, requestNew = false) {
    if (!validator.isValidArray(achievementIds)) {
      throw new Error('achievementIds must be an array');
    } else if (achievementIds.length === 0) {
      throw new Error('achievementIds cannot be an empty array');
    }

    for (const achievementId of achievementIds) {
      if (!validator.isValidNumber(achievementId)) {
        throw new Error('achievementId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(achievementId)) {
        throw new Error('achievementId cannot be less than or equal to 0');
      }
    }

    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a valid number');
    } else if (!Object.values(constants.language).includes(language)) {
      throw new Error('language is invalid');
    }

    const achievements = [];

    if (!requestNew && this._achievements[language]) {
      const cached = this._achievements[language].filter((achievement) => achievementIds.includes(achievement.id));

      if (cached.length > 0) {
        achievements.push(...cached);
      }
    }
    if (achievements.length !== achievementIds.length) {
      for (const batchAchievementIdList of this._api.utility().batchArray(achievementIds.filter((achievementId) => !achievements.some((achievement) => achievement.id === achievementId)), 50)) {
        const result = await this._websocket.emit(request.ACHIEVEMENT, {
          headers: {
            version: 2
          },
          body: {
            idList: batchAchievementIdList,
            languageId: language
          }
        });

        if (result.success) {
          for (const [index, achievement] of result.body.map((resp) => new Response(resp)).entries()) {
            if (achievement.success) {
              achievements.push(this._process(achievement.body, language));
            } else {
              achievements.push({
                id: batchAchievementIdList[index],
                exists: false
              });
            }
          }
        } else {
          achievements.push(...batchAchievementIdList.map((id) => ({
            id,
            exists: false
          })));
        }
      }
    }

    return achievements;
  }

  _process (achievement, language) {
    achievement.exists = true;

    if (this._achievements[language]) {
      this._achievements[language].push(achievement);
    } else {
      this._achievements[language] = [achievement];
    }

    return achievement;
  }

  _clearCache () {
    this._categories = {};
    this._achievements = {};
    this._group._clearCache();
    this._subscriber._clearCache();
  }
};

const Helper = require('../Helper');

const constants = require('@dawalters1/constants');
const validator = require('@dawalters1/validator');
const request = require('../../constants/request');
const Response = require('../../networking/Response');
const Group = require('./Group');
const Subscriber = require('./Subscriber');

module.exports = class Achievement extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);

    this._categories = {};
    this._achievements = {};

    this._group = new Group(bot);
    this._subscriber = new Subscriber(bot);
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
    try {
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
    } catch (error) {
      error.method = `Helper/Achievement/getCategoryList(language = ${JSON.stringify(language)}, requestNew =  ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get achievements from their ID and Language - Use @dawalters1/constants for language
   * @param {[Number]} achievementIds - The ids of the achievements
   * @param {Number} language - Language of the achievement
   * @param {Boolean} requestNew - Request new data from the server
   * @returns
   */
  async getAchievementByIds (achievementIds, language = constants.language.ENGLISH, requestNew = false) {
    try {
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
        for (const batchAchievementIdList of this._bot.utility().batchArray(achievementIds.filter((achievementId) => !achievements.some((achievement) => achievement.id === achievementId)), 50)) {
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
                achievement.push({
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
    } catch (error) {
      error.method = `Helper/Achievement/getAchievementByIds(achievementIds = ${JSON.stringify(achievementIds)}, language = ${JSON.stringify(language)}, requestNew =  ${JSON.stringify(requestNew)})`;
      throw error;
    }
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

  _cleanUp () {
    this._categories = {};
    this._achievements = {};
  }
};

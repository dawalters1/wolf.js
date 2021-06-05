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

    this._cache = {};

    this._group = new Group(bot);
    this._subscriber = new Subscriber(bot);
  }

  group () {
    return this._group;
  }

  subscriber () {
    return this._subscriber;
  }

  async getCategoryList (language = constants.language.ENGLISH, requestNew = false) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is invalid');
      }

      if (!requestNew && this._cache[`categoryList-${language}`]) {
        return this._cache[`categoryList-${language}`];
      }

      const result = await this._websocket.emit(request.ACHIEVEMENT_CATEGORY_LIST, {
        languageId: language
      });

      if (result.success) {
        this._cache[`categoryList-${language}`] = result.body;
      }

      return this._cache[`categoryList-${language}`] || [];
    } catch (error) {
      error.method = `Helper/Achievement/getCategoryList(language = ${JSON.stringify(language)}, requestNew =  ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

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

      if (!requestNew && this._cache[`achievementsList-${language}`]) {
        const cached = this._cache[`achievementsList-${language}`].filter((achievement) => achievementIds.includes(achievement.id));

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
                achievement.push({ id: batchAchievementIdList[index], exists: false });
              }
            }
          } else {
            achievements.push(...batchAchievementIdList.map((id) => ({ id, exists: false })));
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

    if (this._cache[`achievementsList-${language}`]) {
      this._cache[`achievementsList-${language}`].push(achievement);
    } else {
      this._cache[`achivementsList-${language}`] = [achievement];
    }

    return achievement;
  }

  _cleanUp () {
    this._cache = {};
  }
};

const BaseHelper = require('../BaseHelper');
const Group = require('./Group');
const Subscriber = require('./Subscriber');
const Response = require('../../models/ResponseObject');

const patch = require('../../utils/Patch');
const { Commands, Language } = require('../../constants');
const validator = require('../../validator');

class Achievement extends BaseHelper {
  constructor (api) {
    super(api);

    this._group = new Group(this._api);
    this._subscriber = new Subscriber(this._api);

    this._achievements = {};
    this._categories = {};
  }

  group () {
    return this._group;
  }

  subscriber () {
    return this._subscriber;
  }

  async getCategoryList (language, requestNew = false) {
    try {
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(Language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew is not a valid boolean');
      }
      if (!requestNew && this._categories[language]) {
        return this._categories[language];
      }

      const result = await this._websocket.emit(
        Commands.ACHIEVEMENT_CATEGORY_LIST,
        {
          languageId: language
        }
      );

      if (result.success) {
        this._categories[language] = result.body;
      }

      return this._categories[language] || [];
    } catch (error) {
      error.internalErrorMessage = `api.achivement${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getCategoryList(language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getById (achievementId, language, requestNew = false) {
    try {
      return (await this.getByIds([achievementId], language, requestNew))[0];
    } catch (error) {
      error.internalErrorMessage = `api.achivement${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getById(achievementId=${JSON.stringify(achievementId)}, language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getByIds (achievementIds, language, requestNew = false) {
    try {
      achievementIds = Array.isArray(achievementIds) ? [...new Set(achievementIds)] : [achievementIds];

      if (achievementIds.length === 0) {
        throw new Error('achievementIds cannot be an empty array');
      }
      for (const achievementId of achievementIds) {
        if (validator.isNullOrUndefined(achievementId)) {
          throw new Error('achievementId cannot be null or undefined');
        } else if (!validator.isValidNumber(achievementId)) {
          throw new Error('achievementId must be a valid number');
        } else if (!validator.isType(achievementId, 'number')) {
          throw new Error('achievementId must be type of number');
        } else if (validator.isLessThanOrEqualZero(achievementId)) {
          throw new Error('achievementId cannot be less than or equal to 0');
        }
      }
      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(Language).includes(language)) {
        throw new Error('language is not valid');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      let achievements = [];

      if (!requestNew && this._achievements[language]) {
        achievements = this._achievements[language].filter((achievement) => achievementIds.includes(achievement.id));
      }

      if (achievements.length !== achievementIds.length) {
        const achievementIdsToRequest = achievementIds.filter((achievementId) => !achievements.some((achievement) => achievement.id === achievementId));

        for (const achievementIdBatch of this._api._utility._array.chunk(achievementIdsToRequest, this._api._botConfig.get('batch.length'))) {
          const result = await this._websocket.emit(
            Commands.ACHIEVEMENT,
            {
              headers: {
                version: 2
              },
              body: {
                idList: achievementIdBatch,
                languageId: language
              }
            }
          );

          if (result.success) {
            const achievementResponses = Object.values(result.body).map((achievementResponse) => new Response(achievementResponse, Commands.ACHIEVEMENT));

            for (const [index, achievementResponse] of achievementResponses.entries()) {
              if (achievementResponse.success) {
                achievements.push(this._process(achievementResponse.body, language));
              } else {
                achievements.push(
                  {
                    id: achievementIdBatch[index],
                    exists: false
                  }
                );
              }
            }
          } else {
            achievements.push(
              ...achievementIdBatch.map((id) =>
                (
                  {
                    id,
                    exists: false
                  }
                )
              )
            );
          }
        }
      }

      return achievements;
    } catch (error) {
      error.internalErrorMessage = `api.achivement${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getByIds(achievementIds=${JSON.stringify(achievementIds)}, language=${JSON.stringify(language)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async _cleanup () {
    this._achievements = {};
  }

  _process (achievement, language) {
    achievement.exists = true;

    if (!this._achievements[language]) {
      this._achievements[language] = [];
    }

    const existing = this._achievements[language].find((ach) => ach.id === achievement.id);

    if (existing) {
      patch(existing, achievement);
    } else {
      this._achievements[language].push(achievement);
    }

    return achievement;
  }
}

module.exports = Achievement;

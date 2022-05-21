const Base = require('../Base');
const Category = require('./Category');
const Group = require('./Group');
const Subscriber = require('./Subscriber');

const models = require('../../models');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

const Constants = require('../../constants');

const { Language, Command } = Constants;

const _ = require('lodash');

class Achievement extends Base {
  constructor (client) {
    super(client, {});

    this.category = new Category(this.client);

    this.group = new Group(client);
    this.subscriber = new Subscriber(client);
  }

  async getById (id, language, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidNumber(language)) {
      throw new WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id]))[0];
  }

  async getByIds (ids, language, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      throw new WOLFAPIError('ids cannot be null or empty', { ids });
    }

    if ([...new Set(ids)].length !== ids.length) {
      throw new WOLFAPIError('ids cannot contain duplicates', { ids });
    }

    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }

    if (!validator.isValidNumber(language)) {
      throw new WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const achievements = !forceNew ? this.cache[language]?.filter((achievement) => ids.includes(achievement.id)) : [];

    if (achievements.length !== ids.length) {
      const idLists = _.chunk(ids.filter((achievementId) => !achievements.some((achievement) => achievement.id === achievementId), this.client.config.get('batching.length')));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.ACHIEVEMENT,
          {
            headers: {
              version: 2
            },
            body: {
              idList,
              languageId: parseInt(language)
            }
          }
        );

        if (response.success) {
          const achievementResponses = Object.values(response.body).map((achievementResponse) => new Response(achievementResponse));

          for (const [index, achievementResponse] of achievementResponses.entries()) {
            achievements.push(achievementResponse.success ? this._process(new models.Achievement(this.client, achievementResponse.body)) : new models.Achievement(this.client, { id: idList[index] }));
          }
        } else {
          achievements.push(...idList.map((id) => new models.Achievement(this.client, { id })));
        }
      }
    }

    return achievements;
  }

  _process (value, language) {
    if (!this.cache[language]) {
      this.cache[language] = [];
    }

    const existing = this.cache[language].find((achievement) => achievement.id === value);

    if (existing) {
      this._patch(existing, value);
    } else {
      this.cache[language].push(value);
    }

    return value;
  }
}

module.exports = Achievement;

import Base from '../Base.js';
import Category from './Category.js';
import Group from './Group.js';
import Subscriber from './Subscriber.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Constants from '../../constants/index.js';
import _ from 'lodash';
const { Language, Command } = Constants;
class Achievement extends Base {
  constructor (client) {
    super(client, {});
    this.category = new Category(this.client);
    this.group = new Group(client);
    this.subscriber = new Subscriber(client);
  }

  /**
     * Request an achievement by ID & Language
     * @param {Number} id - The ID of the achievement to request
     * @param {Language} language - The language of the achievement to request
     * @returns {Promise<models.Achievement>} - The requested achievement
     */
  async getById (id, language, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }
    if (!validator.isValidNumber(language)) {
      throw new models.WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }
    return (await this.getByIds([id]))[0];
  }

  /**
     * Request multiple achievements by IDs & Language
     * @param {Number|Number[]} ids - The IDs of the achievements to request
     * @param {Language} language - The language of the achievement to request
     * @returns {Promise<Array<models.Achievement>>} - The requested achievements
     */
  async getByIds (ids, language, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);
    if (!ids.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
    }
    if ([...new Set(ids)].length !== ids.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
    }
    for (const id of ids) {
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }
    }
    if (!validator.isValidNumber(language)) {
      throw new models.WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }
    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }
    const achievements = !forceNew ? this.cache[language]?.filter((achievement) => ids.includes(achievement.id)) : [];
    if (achievements.length !== ids.length) {
      const idLists = _.chunk(ids.filter((achievementId) => !achievements.some((achievement) => achievement.id === achievementId), this.client._botConfig.get('batching.length')));
      for (const idList of idLists) {
        const response = await this.client.websocket.emit(Command.ACHIEVEMENT, {
          headers: {
            version: 2
          },
          body: {
            idList,
            languageId: parseInt(language)
          }
        });
        if (response.success) {
          const achievementResponses = Object.values(response.body).map((achievementResponse) => new models.Response(achievementResponse));
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
export default Achievement;

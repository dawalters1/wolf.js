import Base from '../Base.js';
import Category from './Category.js';
import Channel from './Channel.js';
import Subscriber from './Subscriber.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Constants, { Language } from '../../constants/index.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

const { Command } = Constants;

class Achievement extends Base {
  constructor (client) {
    super(client);

    this.achievements = {};

    this.category = new Category(this.client);
    this.channel = new Channel(client);
    this.group = this.channel;
    this.subscriber = new Subscriber(client);
  }

  /**
   * Request an achievement by ID & Language
   * @param {Number} id - The ID of the achievement to request
   * @param {Number} language - The language of the achievement to request
   * @param {Boolean} forceNew - - Whether or not to request new from the server
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
      throw new models.WOLFAPIError('language is not valid', { language });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds([id], language, forceNew))[0];
  }

  /**
   * Request multiple achievements by IDs & Language
   * @param {Number|Number[]} ids - The IDs of the achievements to request
   * @param {Number} language - The language of the achievement to request
   * @param {Boolean} forceNew - Whether or not to request new from the server
   * @returns {Promise<Array<models.Achievement>>} - The requested achievements
   */
  async getByIds (ids, language, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!ids.length) {
      return [];
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
      throw new models.WOLFAPIError('language is not valid', { language });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const achievements = forceNew
      ? []
      : this.achievements[language]?.filter((achievement) =>
        ids.includes(achievement.id)
      ) ?? [];

    if (achievements.length === ids.length) {
      return achievements;
    }

    const idLists = _.chunk(
      ids.filter(
        (achievementId) => !achievements.some((achievement) => achievement.id === achievementId)
      ),
      this.client._frameworkConfig.get('batching.length')
    );

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
        achievements.push(...Object.values(response.body)
          .map((achievementResponse) => new models.Response(achievementResponse))
          .map((achievementResponse, index) =>
            achievementResponse.success
              ? this._process(new models.Achievement(this.client, achievementResponse.body), language)
              : new models.Achievement(this.client, { id: idList[index] }
              )
          )
        );
      } else {
        achievements.push(...idList.map((id) => new models.Achievement(this.client, { id })));
      }
    }

    return achievements;
  }

  _process (value, language) {
    if (!this.achievements[language]) {
      this.achievements[language] = [];
    }

    (Array.isArray(value) ? value : [value]).forEach((achievement) => {
      const existing = this.achievements[language].find((cached) => achievement.id === cached.id);

      existing ? patch(existing, value) : this.achievements[language].push(value);
    });

    return value;
  }

  _cleanUp (reconnection = false) {
    this.achievements = {};
    this.category._cleanUp(reconnection);
    this.channel._cleanUp(reconnection);
    this.subscriber._cleanUp(reconnection);
  }
}

export default Achievement;

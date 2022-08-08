import { Base } from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Constants from '../../constants/index.js';

const { Language, Command } = Constants;

class Category extends Base {
  constructor (client) {
    super(client, {});
  }

  /**
     * Request achievements category list by Language
     * @param {Language} language - The language of achievement category list
     * @returns {Promise<Array<models.AchievementCategory>} - The achievement category list
     */
  async getList (language, forceNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new models.WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }

    if (!forceNew && this.cache[language]) {
      return this.cache[language];
    }

    const response = await this.client.websocket.emit(Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        languageId: parseInt(language)
      }
    );

    return this._process(response.success ? response.body.map((category) => models.AchievementCategory(this.client, category)) : undefined, language);
  }

  _process (list, language) {
    this.cache[language] = list;

    return list;
  }
}

export { Category };

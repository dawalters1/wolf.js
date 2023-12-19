import Base from '../Base.js';
import models from '../../models/index.js';
import Constants, { Language } from '../../constants/index.js';
import validator from '../../validator/index.js';

const { Command } = Constants;

class Category extends Base {
  constructor (client) {
    super(client);

    this.categories = {};
  }

  /**
   * Request achievements category list by Language
   * @param {Number} language - The language of achievement category list
   * @param {Boolean} forceNew
   * @returns {Promise<Array<AchievementCategory>>} - The achievement category list
   */
  async getList (language, forceNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new models.WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new models.WOLFAPIError('language is not valid', { language });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.categories[language]) {
      return this.categories[language];
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        languageId: parseInt(language)
      }
    );

    return this._process(response.body?.map((category) => new models.AchievementCategory(this.client, category)) ?? undefined, language);
  }

  _process (categories, language) {
    this.categories[language] = categories;

    return categories;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return false; }
    this.categories = {};
  }
}

export default Category;

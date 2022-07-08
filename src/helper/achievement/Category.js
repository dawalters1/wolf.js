const Base = require('../Base');
const models = require('../../models');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

const Constants = require('../../constants');

const { Language, Command } = Constants;

class Category extends Base {
  constructor (client) {
    super(client, {});
  }

  async getList (language, forceNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new WOLFAPIError('language must be a valid number', { language });
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', { language });
    }

    if (!forceNew && this.cache[language]) {
      return this.cache[language];
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        languageId: parseInt(language)
      }
    );

    this.cache[language] = response.success ? response.body.map((category) => models.AchievementCategory(this.client, category)) : undefined;

    return this.cache[language];
  }
}

module.exports = Category;

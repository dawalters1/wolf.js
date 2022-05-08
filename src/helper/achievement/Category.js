const Base = require('../Base');
const models = require('../../models');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

const Constants = require('../../constants');

const { Language, Command } = Constants;

class Category extends Base {
  constructor (client) {
    super(client);

    this._categories = {};
  }

  async getList (language, forceNew = false) {
    if (!validator.isValidNumber(language)) {
      throw new WOLFAPIError('language must be a valid number', language);
    } else if (!Object.values(Language).includes(parseInt(language))) {
      throw new Error('language is not valid', language);
    }

    if (!forceNew && this._categories[language]) {
      return this._categories[language];
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        languageId: parseInt(language)
      }
    );

    this._categories[language] = response.success ? response.body.map((category) => models.AchievementUnlockable(this.client, category)) : undefined;

    return this._categories[language];
  }
}

module.exports = Category;

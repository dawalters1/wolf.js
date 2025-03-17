'use strict';

// Node dependencies

// 3rd Party Dependencies

// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import DataManager from '../../manager/DataManager.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Language } from '../../constants/index.js';

class AchievementCategory extends Base {
  constructor (client) {
    super(client);

    this._achievementCategories = new DataManager('id', 600);
  }

  async get (languageId, forceNew = false) {
    languageId = parseInt(languageId);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(languageId)) {
        throw new Error(`AchievementCategory.get() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid number`);
      } else if (Object.values(Language).includes(languageId)) {
        throw new Error(`AchievementCategory.get() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid languageId`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`AchievementCategory.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this._achievementCategories.cache.values();

      if (cached && cached.every((category) => category._hasLanguage(languageId))) {
        return cached;
      }
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return response.body.map((achievementCategory) =>
      this._achievementCategories._add(new structures.AchievementCategory(this.client, achievementCategory), languageId)
    );
  }
}

export default AchievementCategory;

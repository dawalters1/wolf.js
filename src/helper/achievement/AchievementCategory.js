'use strict';

// Node dependencies

// 3rd Party Dependencies

// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import Cache from '../../cache/Cache.js';
import structures from '../../structures/index.js';
// Variables
import { CacheInstanceType, Command, Language } from '../../constants/index.js';

class AchievementCategory extends Base {
  constructor (client) {
    super(client);

    /*
      Map<languageId, Map<id, AchievementCategory>>
    */
    this.cache = new Cache('id', CacheInstanceType.MAP);
  }

  async get (languageId, forceNew = false) {
    languageId = parseInt(languageId);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(languageId)) {
        throw new Error(`Category.get() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid number`);
      } else if (Object.values(Language).includes(languageId)) {
        throw new Error(`Category.get() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid languageId`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Category.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this.cache.get(languageId);

      if (cached) { return cached.values(); }
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return this.cache.set(
      languageId,
      response.body.map((achievementCategory) => new structures.AchievementCategory(this.client, achievementCategory))
    );
  }
}

export default AchievementCategory;

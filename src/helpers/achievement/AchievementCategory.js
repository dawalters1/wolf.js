import AchievementCategory from '../../entities/AchievementCategory.js';
import BaseHelper from '../BaseHelper.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validation/Validation.js';

export default class AchievementCategoryHelper extends BaseHelper {
  async fetch (languageId, opts) {
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(languageId, this, this.fetch)
      .isNotNullOrUndefined()
      .in(Object.values(Language));

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew) {
      const cached = this.store.filter((item) => item.languageId === normalisedLanguageId);

      if (cached.length) { return cached; }
    }

    this.store.delete((item) => item.languageId === normalisedLanguageId);

    const response = await this.client.websocket.emit(
      'achievement category list',
      {
        body: {
          languageId: normalisedLanguageId
        }
      }
    );

    return response.body.map((serverAchievementCategory) =>
      this.store.set(
        new AchievementCategory(this.client, serverAchievementCategory),
        response.headers?.maxAge
      )
    );
  }
}

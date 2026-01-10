import AchievementCategory from '../../entities/AchievementCategory.js';
import BaseHelper from '../BaseHelper.js';

export default class AchievementCategoryHelper extends BaseHelper {
  async fetch (languageId, opts) {
    const normalisedLanguageId = this.normaliseNumber(languageId);

    // TODO: validation
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

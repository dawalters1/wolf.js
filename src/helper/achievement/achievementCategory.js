import AchievementCategory from '../../entities/achievementCategory.js';
import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validator/index.js';

class AchievementCategoryHelper extends BaseHelper {
  async list (languageId, opts) {
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(languageId)
        .isNotNullOrUndefined(`AchievementCategoryHelper.list() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `AchievementCategoryHelper.list() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementCategoryHelper.list() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cachedAchievementCategories = this.cache.values().filter((achievementCategory) => achievementCategory.languageId === languageId);

      if (cachedAchievementCategories.languageId) {
        return cachedAchievementCategories;
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

    return response.body.map((serverAchievementCategory) => {
      const key = this.cache.getKey(serverAchievementCategory, languageId);

      const existing = this.cache.get(key);

      return this.cache.set(
        key,
        existing?.patch(serverAchievementCategory) ?? new AchievementCategory(this.client, serverAchievementCategory),
        response.headers?.maxAge
      );
    });
  }
}

export default AchievementCategoryHelper;

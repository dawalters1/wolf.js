import AchievementCategory from '../../entities/achievementCategory.js';
import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';

class AchievementCategoryHelper extends BaseHelper {
  async list (languageId, opts) {
    if (!opts?.forceNew) {
      const cachedAchievementCategories = this.cache.values();

      if (cachedAchievementCategories && cachedAchievementCategories.every((achievementCategory) => achievementCategory.hasLanguage(languageId))) {
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
      const existing = this.cache.get(serverAchievementCategory.id);

      return this.cache.set(
        existing
          ? existing.patch(serverAchievementCategory)
          : new AchievementCategory(this.client, serverAchievementCategory)
      );
    });
  }
}

export default AchievementCategoryHelper;

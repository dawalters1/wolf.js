import AchievementCategory from '../../structures/achievementCategory.ts';
import { AchievementCategoryOptions } from '../../options/requestOptions.ts';
import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';

class AchievementCategoryHelper extends BaseHelper<AchievementCategory> {
  async list (languageId: Language, opts?: AchievementCategoryOptions): Promise<AchievementCategory[]> {
    if (!opts?.forceNew) {
      const cachedAchievementCategories = this.cache.values();

      if (cachedAchievementCategories && cachedAchievementCategories.every((achievementCategory) => achievementCategory.hasLanguage(languageId))) {
        return cachedAchievementCategories;
      }
    }

    const response = await this.client.websocket.emit<AchievementCategory[]>(
      Command.ACHIEVEMENT_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      });

    return this.cache.setAll(response.body);
  }
}

export default AchievementCategoryHelper;

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { AchievementCategoryOptions } from '../../options/requestOptions.ts';
import AchievementCategory from '../../structures/achievementCategory.ts';
import BaseHelper from '../baseHelper.ts';

class AchievementCategoryHelper extends BaseHelper<AchievementCategory> {
  constructor (client: WOLF) {
    super(client)
  }

  async list (languageId: Language, opts?: AchievementCategoryOptions): Promise<AchievementCategory[]> {
    if (!opts?.forceNew) {
      const cachedAchievementCategories = this.cache!.values();

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

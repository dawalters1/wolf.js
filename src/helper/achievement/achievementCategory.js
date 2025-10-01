import AchievementCategory from '../../entities/achievementCategory.js';
import AchievementCategoryStore from '../../stores_old/AchievementCategoryStore.js';
import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validator/index.js';

class AchievementCategoryHelper extends BaseHelper {
  constructor (client) {
    super(client, AchievementCategoryStore);
  }

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
      const cachedAchievementCategories = this.store.get(languageId);

      if (cachedAchievementCategories) {
        return cachedAchievementCategories.values();
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

    return this.store.set(
      languageId,
      response.body.map((serverAchievementCategory) =>
        new AchievementCategory(this.client, serverAchievementCategory)
      ),
      response.headers?.maxAge
    );
  }
}

export default AchievementCategoryHelper;

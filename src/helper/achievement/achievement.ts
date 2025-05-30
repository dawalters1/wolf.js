import Achievement from '../../structures/achievement.ts';
import {Language} from '../../constants/Language.ts';
import {Command} from '../../constants/Command.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import WOLF from '../../client/WOLF.ts';
import AchievementCategoryHelper from './achievementCategory.ts';
import BaseHelper from '../baseHelper.ts';
import {AchievementOptions} from '../../options/requestOptions.ts';

class AchievementHelper extends BaseHelper<Achievement> {
  category: Readonly<AchievementCategoryHelper>;

  constructor(client: WOLF) {
    super(client);

    this.category = new AchievementCategoryHelper(client);
  }

  async getById(achievementId: number, languageId: Language, opts?: AchievementOptions): Promise<Achievement | null> {
    return (await this.getByIds([achievementId], languageId, opts))[0];
  }

  async getByIds(achievementIds: number[], languageId: Language, opts?: AchievementOptions): Promise<(Achievement | null)[]> {
    const achievementsMap = new Map<number, Achievement>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedAchievements = this.cache.getAll(achievementIds)
        .filter((achievement): achievement is Achievement => achievement !== null && achievement.hasLanguage(languageId));

      cachedAchievements.forEach((achievement) => achievementsMap.set(achievement.id, achievement));
    }

    const missingIds = achievementIds.filter((id) => !achievementsMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<WOLFResponse<Achievement>[]>(
        Command.ACHIEVEMENT,
        {
          body: {
            idList: missingIds,
            languageId
          }
        }
      );

      response.body.filter((achievementResponse) => achievementResponse.success)
        .forEach((achievementResponse) => achievementsMap.set(achievementResponse.body.id, this.cache!.set(achievementResponse.body)));
    }

    return achievementIds.map((achievementId) => achievementsMap.get(achievementId) ?? null);
  }
}

export default AchievementHelper;

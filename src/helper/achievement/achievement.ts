import Achievement from '../../structures/achievement.ts';
import AchievementCategoryHelper from './achievementCategory.ts';
import AchievementChannelHelper from './achievementChannel.ts';
import { AchievementOptions } from '../../options/requestOptions.ts';
import AchievementUserHelper from './achievementUser.ts';
import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';
import WOLF from '../../client/WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class AchievementHelper extends BaseHelper<Achievement> {
  readonly category: AchievementCategoryHelper;
  readonly user: AchievementUserHelper;
  readonly channel: AchievementChannelHelper;

  constructor (client: WOLF) {
    super(client);

    this.category = new AchievementCategoryHelper(client);
    this.channel = new AchievementChannelHelper(client);
    this.user = new AchievementUserHelper(client);
  }

  async getById (achievementId: number, languageId: Language, opts?: AchievementOptions): Promise<Achievement | null> {
    return (await this.getByIds([achievementId], languageId, opts))[0];
  }

  async getByIds (achievementIds: number[], languageId: Language, opts?: AchievementOptions): Promise<(Achievement | null)[]> {
    const achievementsMap = new Map<number, Achievement>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedAchievements = this.cache.getAll(achievementIds)
        .filter((achievement): achievement is Achievement => achievement !== null && achievement.hasLanguage(languageId));

      cachedAchievements.forEach((achievement) => achievementsMap.set(achievement.id, achievement));
    }

    const missingIds = achievementIds.filter((id) => !achievementsMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<Achievement>>>(
        Command.ACHIEVEMENT,
        {
          body: {
            idList: missingIds,
            languageId
          }
        }
      );

      response.body.values().filter((achievementResponse) => achievementResponse.success)
        .forEach((achievementResponse) => achievementsMap.set(achievementResponse.body.id, this.cache.set(achievementResponse.body)));
    }

    return achievementIds.map((achievementId) => achievementsMap.get(achievementId) ?? null);
  }
}

export default AchievementHelper;

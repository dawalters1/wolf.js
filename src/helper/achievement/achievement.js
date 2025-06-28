import Achievement from '../../entities/achievement.js';
import AchievementCategoryHelper from './achievementCategory.js';
import AchievementChannelHelper from './achievementChannel.js';
import AchievementUserHelper from './achievementUser.js';
import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';

class AchievementHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.category = new AchievementCategoryHelper(client);
    this.channel = new AchievementChannelHelper(client);
    this.user = new AchievementUserHelper(client);
  }

  async getById (achievementId, languageId, opts) {
    return (await this.getByIds([achievementId], languageId, opts))[0];
  }

  async getByIds (achievementIds, languageId, opts) {
    const achievementsMap = new Map();

    if (!opts?.forceNew) {
      const cachedAchievements = this.cache.getAll(achievementIds)
        .filter((achievement) => achievement !== null && achievement.hasLanguage(languageId));

      cachedAchievements.forEach((achievement) => achievementsMap.set(achievement.id, achievement));
    }

    const idsToFetch = achievementIds.filter((id) => !achievementsMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.ACHIEVEMENT,
        {
          body: {
            idList: idsToFetch,
            languageId
          }
        }
      );

      response.body
        .filter((achievementResponse) => achievementResponse.success)
        .forEach((achievementResponse) => {
          const existing = this.cache.get(achievementResponse.body.id);

          achievementsMap.set(
            achievementResponse.body.id,
            this.cache.set(
              existing
                ? existing.patch(achievementResponse.body)
                : new Achievement(this.client, achievementResponse.body)
            )
          );
        });
    }

    return achievementIds.map((achievementId) => achievementsMap.get(achievementId) ?? null);
  }
}

export default AchievementHelper;

import AchievementUser from '../../entities/AchievementUser.js';
import BaseHelper from '../BaseHelper.js';
import { validate } from '../../validation/Validation.js';

export default class AchievementUserHelper extends BaseHelper {
  async fetch (userId, parentId, opts) {
    const normalisedUserId = this.normaliseNumber(userId);
    const normalisedParentId = this.normaliseNumber(parentId);

    validate(normalisedUserId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedParentId, this, this.fetch)
      .isNotRequired()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const user = await this.client.user.fetch(userId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} NOT FOUND`); }

    const requestAchievements = async (includeParentId = false) => {
      const response = await this.client.websocket.emit(
        'achievement subscriber list',
        {
          headers: {
            version: 2
          },
          body: {
            id: normalisedUserId,
            parentId: includeParentId
              ? normalisedParentId
              : undefined
          }
        }
      );

      if (!includeParentId) {
        user.achievementStore.clear();
        user.achievementStore.fetched = true;
      }

      const maxAge = response.headers?.maxAge;

      return response.body.map(
        (serverAchievementUser) => {
          serverAchievementUser.subscriberId = normalisedUserId;

          return user.achievementStore.set(
            new AchievementUser(this.client, serverAchievementUser),
            maxAge
          );
        }
      );
    };

    const achievements = await (async () => {
      if (!opts?.forceNew) {
        const cached = user.achievementStore.filter((item) => item.userId === userId);

        if (cached) { return cached; }
      }

      return await requestAchievements();
    })();

    if (!parentId) { return achievements; }

    const parentAchievement = achievements.find((achievement) => achievement.id === parentId);

    if (parentAchievement === null) { throw new Error(`Parent achievement with ID ${normalisedParentId} NOT FOUND for User with ID ${normalisedUserId}`); }

    if (!parentAchievement.childrenId) {
      const childrenAchievements = await requestAchievements(true);

      parentAchievement.childrenId = new Set(
        childrenAchievements
          .filter((achievement) => achievement.id !== parentId)
          .map((achievement) => achievement.id)
      );
    }

    return [parentAchievement, ...user.achievementStore.filter((item) => item.userId === userId && parentAchievement.childrenId.has(item.id))];
  }
}

import AchievementUser from '../../entities/achievementUser.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AchievementUserHelper {
  constructor (client) {
    this.client = client;
  }

  async get (userId, parentId, opts) {
    userId = Number(userId) || userId;
    parentId = Number(parentId) || parentId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`AchievementUserHelper.get() parameter, achievementId: ${userId} is null or undefined`)
        .isValidNumber(`AchievementUserHelper.get() parameter, achievementId: ${userId} is not a valid number`)
        .isGreaterThanZero(`AchievementUserHelper.get() parameter, achievementId: ${userId} is less than or equal to zero`);

      validate(parentId)
        .isNotRequired()
        .isNotNullOrUndefined(`AchievementUserHelper.get() parameter, parentId: ${parentId} is null or undefined`)
        .isValidNumber(`AchievementUserHelper.get() parameter, parentId: ${parentId} is not a valid number`)
        .isGreaterThanZero(`AchievementUserHelper.get() parameter, parentId: ${parentId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementUserHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    const user = await this.client.user.getById(userId);
    if (user === null) {
      throw new Error(`User with ID ${userId} not found`);
    }

    let achievements;

    if (!opts?.forceNew && user._achievements.fetched) {
      achievements = user._achievements.values();
    } else {
      const response = await this.client.websocket.emit(
        Command.ACHIEVEMENT_SUBSCRIBER_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: userId
          }
        }
      );

      user._achievements.fetched = true;
      achievements = response.body.map(serverAchievementUser => {
        const existing = user._achievements.get(serverAchievementUser);

        return user._achievements.set(
          existing?.patch(serverAchievementUser) ?? new AchievementUser(this.client, serverAchievementUser),
          response.headers?.maxAge
        );
      });
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = user._achievements.get(parentId);
    if (parentAchievement === null) {
      throw new Error(`Parent achievement with ID ${parentId} not found`);
    }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...user._achievements.mGet([...parentAchievement.childrenId])];
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_GROUP_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: userId,
          parentId
        }
      }
    );

    parentAchievement.childrenId = new Set(
      response.body
        .map(serverAchievementUser => serverAchievementUser.id)
        .filter(id => id !== parentId)
    );

    return response.body.map(serverAchievementUser => {
      const existing = user._achievements.get(serverAchievementUser);

      return user._achievements.set(
        existing?.patch(serverAchievementUser) ?? new AchievementUser(this.client, serverAchievementUser),
        response.headers?.maxAge
      );
    });
  }
}

export default AchievementUserHelper;

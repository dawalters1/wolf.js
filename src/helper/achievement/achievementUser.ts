import AchievementUser, { ServerAchievementUser } from '../../structures/achievementUser.ts';
import { Command } from '../../constants/Command.ts';
import WOLF from '../../client/WOLF.ts';

class AchievementUserHelper {
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async get (userId: number, parentId?: number, forceNew?: boolean): Promise<(AchievementUser | null)[]> {
    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(`User with ID ${userId} not found`); }

    let achievements: (AchievementUser | null)[];

    if (!forceNew && user._achievements.fetched) {
      achievements = user._achievements.values();
    } else {
      const response = await this.client.websocket.emit<ServerAchievementUser[]>(
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
      achievements = response.body.map((serverAchievementUser) => {
        const existing = user._achievements.get(serverAchievementUser.id);

        return user._achievements.set(
          existing
            ? existing.patch(serverAchievementUser)
            : new AchievementUser(this.client, serverAchievementUser)
        );
      });
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = user._achievements.get(parentId);
    if (parentAchievement === null) { throw new Error(`Parent achievement with ID ${parentId} not found`); }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...user._achievements.getAll([...parentAchievement.childrenId])];
    }

    const response = await this.client.websocket.emit<AchievementUser[]>(
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
      response.body.map((serverAchievementUser) => serverAchievementUser.id).filter(id => id !== parentId)
    );

    return response.body.map((serverAchievementUser) => {
      const existing = user._achievements.get(serverAchievementUser.id);

      return user._achievements.set(
        existing
          ? existing.patch(serverAchievementUser)
          : new AchievementUser(this.client, serverAchievementUser)
      );
    });
  }
}

export default AchievementUserHelper;

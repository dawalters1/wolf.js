import AchievementUser from '../../structures/achievementUser.ts';
import { Command } from '../../constants/Command.ts';
import WOLF from '../../client/WOLF.ts';

class AchievementUserHelper {
  client: Readonly<WOLF>;
  constructor (client: WOLF) {
    this.client = client;
  }

  async get (userId: number, parentId?: number, forceNew?: boolean): Promise<(AchievementUser | null)[]> {
    const user = await this.client.user.getById(userId);
    if (user === null) throw new Error('User not found');

    let achievements: (AchievementUser | null)[];

    if (!forceNew && user.achievements.fetched) {
      achievements = user.achievements.values();
    } else {
      const { body } = await this.client.websocket.emit<AchievementUser[]>(
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
      achievements = user.achievements.setAll(body);
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = user.achievements.get(parentId);
    if (parentAchievement === null) throw new Error('Parent achievement not found');

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...user.achievements.getAll([...parentAchievement.childrenId])];
    }

    const { body: children } = await this.client.websocket.emit<AchievementUser[]>(
      Command.ACHIEVEMENT_SUBSCRIBER_LIST,
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
      children.map(child => child.id).filter(id => id !== parentId)
    );

    return children;
  }
}

export default AchievementUserHelper;

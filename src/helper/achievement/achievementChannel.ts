import AchievementChannel from '../../structures/achievementChannel.ts';
import { Command } from '../../constants/Command.ts';
import WOLF from '../../client/WOLF.ts';

class AchievementChannelHelper {
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async get (channelId: number, parentId?: number, forceNew?: boolean): Promise<(AchievementChannel | null)[]> {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    let achievements: (AchievementChannel | null)[];

    if (!forceNew && channel.achievements.fetched) {
      achievements = channel.achievements.values();
    } else {
      const { body } = await this.client.websocket.emit<AchievementChannel[]>(
        Command.ACHIEVEMENT_GROUP_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: channelId
          }
        }
      );
      achievements = channel.achievements.setAll(body);
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = channel.achievements.get(parentId);
    if (parentAchievement === null) { throw new Error(`Parent achievement with ID ${parentId} not found`); }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...channel.achievements.getAll([...parentAchievement.childrenId])];
    }

    const { body: children } = await this.client.websocket.emit<AchievementChannel[]>(
      Command.ACHIEVEMENT_GROUP_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: channelId,
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

export default AchievementChannelHelper;

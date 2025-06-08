import AchievementChannel, { ServerAchievementChannel } from '../../structures/achievementChannel.ts';
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
      const response = await this.client.websocket.emit<ServerAchievementChannel[]>(
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

      achievements = response.body.map((serverAchievementChannel) => {
        const existing = channel.achievements.get(serverAchievementChannel.id);

        return channel.achievements.set(
          existing
            ? existing.patch(serverAchievementChannel)
            : new AchievementChannel(this.client, serverAchievementChannel)
        );
      });
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = channel.achievements.get(parentId);
    if (parentAchievement === null) { throw new Error(`Parent achievement with ID ${parentId} not found`); }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...channel.achievements.getAll([...parentAchievement.childrenId])];
    }

    const response = await this.client.websocket.emit<AchievementChannel[]>(
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
      response.body.map((serverAchievementChannel) => serverAchievementChannel.id).filter(id => id !== parentId)
    );

    return response.body.map((serverAchievementChannel) => {
      const existing = channel.achievements.get(serverAchievementChannel.id);

      return channel.achievements.set(
        existing
          ? existing.patch(serverAchievementChannel)
          : new AchievementChannel(this.client, serverAchievementChannel)
      );
    });
  }
}

export default AchievementChannelHelper;

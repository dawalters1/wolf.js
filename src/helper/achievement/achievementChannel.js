import AchievementChannel from '../../entities/achievementChannel.js';
import { Command } from '../../constants/Command.js';

class AchievementChannelHelper {
  constructor (client) {
    this.client = client;
  }

  async get (channelId, parentId, forceNew) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    let achievements;

    if (!forceNew && channel._achievements.fetched) {
      achievements = channel._achievements.values();
    } else {
      const response = await this.client.websocket.emit(
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

      channel._achievements.fetched = true;
      achievements = response.body.map(serverAchievementChannel => {
        const existing = channel._achievements.get(serverAchievementChannel.id);

        return channel._achievements.set(
          existing
            ? existing.patch(serverAchievementChannel)
            : new AchievementChannel(this.client, serverAchievementChannel)
        );
      });
    }

    if (!parentId) {
      return achievements;
    }

    const parentAchievement = channel._achievements.get(parentId);
    if (parentAchievement === null) {
      throw new Error(`Parent achievement with ID ${parentId} not found`);
    }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...channel._achievements.getAll([...parentAchievement.childrenId])];
    }

    const response = await this.client.websocket.emit(
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
      response.body
        .map(serverAchievementChannel => serverAchievementChannel.id)
        .filter(id => id !== parentId)
    );

    return response.body.map(serverAchievementChannel => {
      const existing = channel._achievements.get(serverAchievementChannel.id);

      return channel._achievements.set(
        existing
          ? existing.patch(serverAchievementChannel)
          : new AchievementChannel(this.client, serverAchievementChannel)
      );
    });
  }
}

export default AchievementChannelHelper;

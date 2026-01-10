import AchievementChannel from '../../entities/AchievementChannel.js';
import BaseHelper from '../BaseHelper.js';

export default class AchievementChannelHelper extends BaseHelper {
  async fetch (channelId, parentId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedParentId = this.normaliseNumber(parentId);

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    const requestAchievements = async (includeParentId = false) => {
      const response = await this.client.websocket.emit(
        'achievement group list',
        {
          headers: {
            version: 2
          },
          body: {
            id: normalisedChannelId,
            parentId: includeParentId
              ? normalisedParentId
              : undefined
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      if (!includeParentId) {
        channel.achievementStore.clear();
        channel.achievementStore.fetched = true;
      }

      return response.body.map(
        (serverAchievementChannel) => {
          serverAchievementChannel.groupId = normalisedChannelId;

          return channel.achievementStore.set(
            new AchievementChannel(this.client, serverAchievementChannel),
            maxAge
          );
        });
    };

    const achievements = await (async () => {
      if (!opts?.forceNew && channel.achievementStore.fetched) { return channel.achievementStore.values(); }

      return await requestAchievements();
    })();

    if (!parentId) { return achievements; }

    const parentAchievement = achievements.find((achievement) => achievement.id === parentId);

    if (parentAchievement === null) { throw new Error(`Parent achievement with ID ${normalisedParentId} NOT FOUND for Channel with ID ${normalisedChannelId}`); }

    if (!parentAchievement.childrenId) {
      const childrenAchievements = await requestAchievements(true);

      parentAchievement.childrenId = new Set(
        childrenAchievements
          .filter((achievement) => achievement.id !== parentId)
          .map((achievement) => achievement.id)
      );
    }

    return [parentAchievement, ...channel.achievementStore.filter((item) => parentAchievement.childrenId.has(item.id))];
  }
}

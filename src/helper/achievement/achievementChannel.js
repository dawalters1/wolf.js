import AchievementChannel from '../../entities/achievementChannel.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AchievementChannelHelper {
  constructor (client) {
    this.client = client;
  }

  async get (channelId, parentId, opts) {
    channelId = Number(channelId) || channelId;
    parentId = Number(parentId) || parentId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AchievementChannelHelper.get() parameter, achievementId: ${channelId} is null or undefined`)
        .isValidNumber(`AchievementChannelHelper.get() parameter, achievementId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AchievementChannelHelper.get() parameter, achievementId: ${channelId} is less than or equal to zero`);

      validate(parentId)
        .isNotRequired()
        .isNotNullOrUndefined(`AchievementChannelHelper.get() parameter, parentId: ${parentId} is null or undefined`)
        .isValidNumber(`AchievementChannelHelper.get() parameter, parentId: ${parentId} is not a valid number`)
        .isGreaterThanZero(`AchievementChannelHelper.get() parameter, parentId: ${parentId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementChannelHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);
    if (channel === null) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    let achievements;

    if (!opts?.forceNew && channel._achievements.fetched) {
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
        const existing = channel._achievements.get(serverAchievementChannel);

        return channel._achievements.set(
          existing?.patch(serverAchievementChannel) ?? new AchievementChannel(this.client, serverAchievementChannel),
          response.headers?.maxAge
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
      return [parentAchievement, ...channel._achievements.mGet([...parentAchievement.childrenId])];
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
      const existing = channel._achievements.get(serverAchievementChannel);

      return channel._achievements.set(
        existing?.patch(serverAchievementChannel) ?? new AchievementChannel(this.client, serverAchievementChannel),
        response.headers?.maxAge
      );
    });
  }
}

export default AchievementChannelHelper;

import AchievementChannel from '../../entities/achievementChannel.js';
import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AchievementChannelHelper extends BaseHelper {
  async get (channelId, parentId, opts) {
    channelId = Number(channelId) || channelId;
    parentId = Number(parentId) || parentId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AchievementChannelHelper.get() parameter, achievementId: ${channelId} is null or undefined`)
        .isValidNumber(`AchievementChannelHelper.get() parameter, achievementId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AchievementChannelHelper.get() parameter, achievementId: ${channelId} is less than or equal to zero`);

      validate(parentId)
        .isNotRequired()
        .isNotNullOrUndefined(`AchievementChannelHelper.get() parameter, parentId: ${parentId} is null or undefined`)
        .isValidNumber(`AchievementChannelHelper.get() parameter, parentId: ${parentId} is not a valid number`)
        .isGreaterThan(0, `AchievementChannelHelper.get() parameter, parentId: ${parentId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementChannelHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);

    if (channel === null) {
      throw new Error(`Channel with ID ${channelId} Not Found`);
    }

    let achievements;

    if (!opts?.forceNew && channel.achievementStore.fetched) {
      achievements = channel.achievementStore.values();
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

      channel.achievementStore.fetched = true;

      achievements = response.body.map(
        (serverAchievementChannel) =>
          channel.achievementStore.set(
            new AchievementChannel(this.client, serverAchievementChannel, channelId),
            response.headers?.maxAge
          )
      );
    }

    if (!parentId) { return achievements; }

    const parentAchievement = channel.achievementStore.get((achievement) => achievement.id === parentId);
    if (parentAchievement === null) {
      throw new Error(`Parent achievement with ID ${parentId} Not Found`);
    }

    if (parentAchievement.childrenId) {
      return [parentAchievement, ...parentAchievement.childrenId.map((childId) => channel.achievementStore.get(childId))];
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
        .map((serverAchievementChannel) =>
          serverAchievementChannel.id
        )
        .filter(id => id !== parentId)
    );

    return response.body.map((serverAchievementChannel) =>
      channel.achievementStore.set(
        new AchievementChannel(this.client, serverAchievementChannel),
        response.headers?.maxAge
      )
    );
  }
}

export default AchievementChannelHelper;

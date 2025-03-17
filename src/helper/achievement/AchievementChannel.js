'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

class AchievementChannel extends Base {
  async get (channelId, parentId, forceNew = false) {
    channelId = parseInt(channelId);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`AchievementChannel.get() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`AchievementChannel.get() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }

      if (!verify.isNull(parentId)) {
        if (!verify.isValidNumber(parentId)) {
          throw new Error(`AchievementChannel.get() parameter, parentId: ${JSON.stringify(parentId)}, is not a valid number`);
        } else if (verify.isLessThanOrEqualZero(parentId)) {
          throw new Error(`AchievementChannel.get() parameter, parentId: ${JSON.stringify(parentId)}, is zero or negative`);
        }
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`AchievementChannel.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const channel = await this.client.channel.getById(channelId);

    if (!channel.exists) { throw new Error('No such channel exists'); }

    if (!forceNew && channel.achievements._fetched) {
      return channel.achievements.cache.values();
    }

    try {
      const response = await this.client.websocket.emit(
        Command.ACHIEVEMENT_GROUP_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: channelId,
            parentId: parentId === null ? undefined : parentId
          }
        }
      );

      channel.achievements._fetched = true;

      return response.body.map((channelAchievement) =>
        channel.achievements._add(new structures.AchievementChannel(this.client, channelAchievement))
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }
}

export default AchievementChannel;

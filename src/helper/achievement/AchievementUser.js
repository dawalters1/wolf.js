'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import AchievementUserCache from '../../cache/AchievementUserCache.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

class AchievementUser extends Base {
  constructor (client) {
    super(client);

    this.achievementUserCache = new AchievementUserCache();
  }

  async get (userId, parentId, forceNew = false) {
    userId = parseInt(userId);

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(userId)) {
        throw new Error(`AchievementUser.get() parameter, userId: ${JSON.stringify(userId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(userId)) {
        throw new Error(`AchievementUser.get() parameter, userId: ${JSON.stringify(userId)}, is zero or negative`);
      }

      if (!verify.isNull(parentId)) {
        if (!verify.isValidNumber(parentId)) {
          throw new Error(`AchievementUser.get() parameter, parentId: ${JSON.stringify(parentId)}, is not a valid number`);
        } else if (verify.isLessThanOrEqualZero(parentId)) {
          throw new Error(`AchievementUser.get() parameter, parentId: ${JSON.stringify(parentId)}, is zero or negative`);
        }
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`AchievementUser.get() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this.achievementUserCache.get(userId);

      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        Command.ACHIEVEMENT_SUBSCRIBER_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: userId,
            parentId: parentId === null ? undefined : parentId
          }
        }
      );

      return this.achievementUserCache.set(
        userId,
        response.body.map((channelAchievement) =>
          new structures.AchievementUser(this.client, channelAchievement)
        )
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }
}

export default AchievementUser;

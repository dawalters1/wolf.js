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

class AchievementUser extends Base {
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

    const user = await this.client.user.getById(userId);

    if (!user.exists) { throw new Error('No such user exists'); }

    if (!forceNew && user.achievements._fetched) {
      return user.achievements.cache.values();
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

      user.achievements._fetched = true;

      return response.body.map((userAchievement) =>
        user.achievements._add(new structures.AchievementUser(this.client, userAchievement))
      );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }

      throw error;
    }
  }
}

export default AchievementUser;

'use strict';

// Node dependencies

// 3rd Party Dependencies

// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import Cache from '../../cache/Cache.js';
import structures from '../../structures/index.js';
// Variables
import { CacheInstanceType, Command } from '../../constants/index.js';

class AchievementUser extends Base {
  constructor (client) {
    super(client);

    /*
      Map<userId, Map<id, AchievementUser>>
    */
    this.cache = new Cache('id', CacheInstanceType.MAP);
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
      const cached = this.cache.get(userId);

      if (cached) { return cached.values(); }
    }

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

    return this.cache.set(
      userId,
      response.body.map((channelAchievement) =>
        new structures.AchievementUser(this.client, channelAchievement)
      )
    );
  }
}

export default AchievementUser;

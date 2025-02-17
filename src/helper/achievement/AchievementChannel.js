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

class AchievementChannel extends Base {
  constructor (client) {
    super(client);

    /*
      Map<channelId, Map<id, AchievementChannel>>
    */
    this.cache = new Cache('id', CacheInstanceType.OBJECT);
  }

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

    if (!forceNew) {
      const cached = this.cache.get(channelId);

      if (cached) { return cached.values(); }
    }

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

    return this.cache.set(
      channelId,
      response.body.map((channelAchievement) =>
        new structures.AchievementChannel(this.client, channelAchievement)
      )
    );
  }
}

export default AchievementChannel;

import Base from '../Base.js';
import { Command } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Channel extends Base {
  /**
   * Request the unlocked achievements for the channel
   * @param {Number} targetChannelId - The ID of the channel
   * @param {Number} parentId - The ID of the parent achievement (Optional)
   * @returns {Promise<Array<models.AchievementUnlockable>>} - The list of unlocked achievements for the channel
   */
  async getById (targetChannelId, parentId = undefined) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!validator.isUndefined(parentId)) {
      if (!validator.isValidNumber(parentId)) {
        throw new models.WOLFAPIError('parentId must be a valid number', { parentId });
      } else if (validator.isLessThanOrEqualZero(parentId)) {
        throw new models.WOLFAPIError('parentId cannot be less than or equal to 0', { parentId });
      }
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_GROUP_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: parseInt(targetChannelId),
          parentId: parentId ? parseInt(parentId) : undefined
        }
      }
    );

    return response.body?.map((achievement) => new models.AchievementUnlockable(this.client, achievement)) ?? [];
  }
}

export default Channel;

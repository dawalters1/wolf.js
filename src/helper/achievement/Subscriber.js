import Base from '../Base.js';
import { Command } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscriber extends Base {
  /**
   * Request the unlocked achievements for the subscriber
   * @param {Number} subscriberId - The ID of the subscriber
   * @param {Number} parentId - The ID of the parent achievement (Optional)
   * @returns {Promise<Array<models.AchievementUnlockable>>} - The list of unlocked achievements for the subscriber
   */
  async getById (subscriberId, parentId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (!validator.isUndefined(parentId)) {
      if (!validator.isValidNumber(parentId)) {
        throw new models.WOLFAPIError('parentId must be a valid number', { parentId });
      } else if (validator.isLessThanOrEqualZero(parentId)) {
        throw new models.WOLFAPIError('parentId cannot be less than or equal to 0', { parentId });
      }
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_SUBSCRIBER_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: parseInt(subscriberId),
          parentId: parentId ? parseInt(parentId) : undefined
        }
      }
    );

    return response.body?.map((achievement) => new models.AchievementUnlockable(this.client, achievement)) ?? [];
  }
}

export default Subscriber;

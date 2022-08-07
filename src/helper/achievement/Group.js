import Base from '../Base.js';
import { Command } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
class Group extends Base {
  /**
     * Request the unlocked achievements for the group
     * @param {Number} targetGroupId - The ID of the group
     * @param {Number} parentId - The ID of the parent achievement (Optional)
     * @returns {Promise<Array<models.AchievementUnlockable>>} - The list of unlocked achievements for the group
     */
  async getById (targetGroupId, parentId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }
    if (parentId) {
      if (!validator.isValidNumber(parentId)) {
        throw new models.WOLFAPIError('parentId must be a valid number', { parentId });
      } else if (validator.isLessThanOrEqualZero(parentId)) {
        throw new models.WOLFAPIError('parentId cannot be less than or equal to 0', { parentId });
      }
    }
    const response = await this.client.websocket.emit(Command.ACHIEVEMENT_GROUP_LIST, {
      headers: {
        version: 2
      },
      body: {
        id: parseInt(targetGroupId),
        parentId: parentId ? parseInt(parentId) : undefined
      }
    });
    return response.success ? response.body.map((achivement) => models.AchievementUnlockable(this.client, achivement)) : [];
  }
}
export default Group;

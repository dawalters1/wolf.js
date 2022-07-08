const Base = require('../Base');
const { Command } = require('../../constants');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const models = require('../../models');

class Group extends Base {
  async getById (targetGroupId, parentId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (parentId) {
      if (!validator.isValidNumber(parentId)) {
        throw new WOLFAPIError('parentId must be a valid number', { parentId });
      } else if (validator.isLessThanOrEqualZero(parentId)) {
        throw new WOLFAPIError('parentId cannot be less than or equal to 0', { parentId });
      }
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_GROUP_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: parseInt(targetGroupId),
          parentId: parentId ? parseInt(parentId) : undefined
        }
      }
    );

    return response.success ? response.body.map((achivement) => models.AchievementUnlockable(this.client, achivement)) : [];
  }
}

module.exports = Group;

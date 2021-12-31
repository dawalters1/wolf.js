const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const { Commands } = require('../../constants');

class Group extends BaseHelper {
  async getById (targetGroupId) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      const result = await this._websocket.emit(Commands.ACHIEVEMENT_GROUP_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: targetGroupId
          }
        });

      return result.success ? result.body : [];
    } catch (error) {
      error.internalErrorMessage = `api.achievement().group().getById(targetGroupId=${JSON.stringify(targetGroupId)})`;
      throw error;
    }
  }
}

module.exports = Group;

const request = require('../../constants/request');
const Helper = require('../Helper');
const validator = require('@dawalters1/validator');

module.exports = class Group extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);
  }

  /**
   * Get achievements for a group
   * @param {Number} targetGroupId - The id of the group
   */
  async getById (targetGroupId) {
    try {
      if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      const result = await this._websocket.emit(request.ACHIEVEMENT_GROUP_LIST, {
        headers: {
          version: 2
        },
        body: {
          id: targetGroupId
        }
      });

      return result.success ? result.body : [];
    } catch (error) {
      error.method = `Helper/Achievement/Group/getById(targetGroupId = ${JSON.stringify(targetGroupId)})`;
      throw error;
    }
  }
};

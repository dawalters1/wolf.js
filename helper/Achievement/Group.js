const request = require('../../constants/request');
const Helper = require('../Helper');
const validator = require('../../utils/validator');

module.exports = class Group extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async getById (groupId) {
    if (!validator.isValidNumber(groupId)) {
      throw new Error('groupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new Error('groupId cannot be less than or equal to 0');
    }

    const result = await this._websocket.emit(request.ACHIEVEMENT_GROUP_LIST, {
      headers: {
        version: 2
      },
      body: {
        id: groupId
      }
    });

    return result.success ? result.body : [];
  }
};

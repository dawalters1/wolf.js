const BaseHelper = require('../BaseHelper');

const validator = require('../../validator/Validator');

class Group extends BaseHelper {
  async getById (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new Error('targetGroupId cannot be null or undefined');
    } else if (validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number', { provided: targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0', 'provided', targetGroupId);
    }
  }
}

module.exports = Group;

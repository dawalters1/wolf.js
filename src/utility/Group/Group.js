const Base = require('../../models/Base');
const Member = require('./Member');

const WOLFAPIError = require('../../models/WOLFAPIError');
const validator = require('../../validator');

class Group extends Base {
  constructor (client) {
    super(client);

    this.member = new Member(client);
  }

  async avatar (targetGroupId, size = 128) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(size)) {
      throw new WOLFAPIError('size cannot be null or undefined', { size });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('size must be a valid number', { size });
    } else if (validator.isLessThanOrEqualZero(size)) {
      throw new WOLFAPIError('size cannot be less than or equal to 0', { size });
    }

    // TODO:
  }
}

module.exports = Group;

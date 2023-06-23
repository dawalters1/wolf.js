import Base from '../../models/Base.js';
import Member from './Member.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import IconSize from '../../constants/IconSize.js';

class Group extends Base {
  constructor (client) {
    super(client);

    this.member = new Member(client);
  }

  async avatar (groupId, size) {
    if (validator.isNullOrUndefined(groupId)) {
      throw new WOLFAPIError('groupId cannot be null or undefined', { groupId });
    } else if (!validator.isValidNumber(groupId)) {
      throw new WOLFAPIError('groupId must be a valid number', { groupId });
    } else if (validator.isLessThanOrEqualZero(groupId)) {
      throw new WOLFAPIError('groupId cannot be less than or equal to 0', { groupId });
    }

    if (validator.isNullOrUndefined(size)) {
      throw new WOLFAPIError('size cannot be null or undefined', { size });
    } else if (!Object.values(IconSize).includes(size)) {
      throw new WOLFAPIError('size is not valid', { size });
    }

    return await this.client.utility.download((await this.client.channel.getById(groupId)).getAvatarUrl(size));
  }
}

export default Group;

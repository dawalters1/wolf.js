import Base from '../../models/Base.js';
import Member from './Member.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';

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

    return await this.client.utility.download(
      this.client.utility.string.replace(`${this.client.endpointConfig.avatarEndpoint}/FileServerSpring/group/avatar/{targetGroupId}?size={size}`,
        {
          targetGroupId,
          size
        }
      )
    );
  }
}

export default Group;

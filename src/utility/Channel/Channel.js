import Member from './Member.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import IconSize from '../../constants/IconSize.js';

class Channel {
  constructor (client) {
    this.client = client;

    this.member = new Member(client);
  }

  /**
   * Get a channels avatar
   * @param {Number} channelId
   * @param {IconSize} size
   * @returns {Promise<Buffer>}
   */
  async avatar (channelId, size) {
    if (validator.isNullOrUndefined(channelId)) {
      throw new WOLFAPIError('channelId cannot be null or undefined', { channelId });
    } else if (!validator.isValidNumber(channelId)) {
      throw new WOLFAPIError('channelId must be a valid number', { channelId });
    } else if (validator.isLessThanOrEqualZero(channelId)) {
      throw new WOLFAPIError('channelId cannot be less than or equal to 0', { channelId });
    }

    if (validator.isNullOrUndefined(size)) {
      throw new WOLFAPIError('size cannot be null or undefined', { size });
    } else if (!Object.values(IconSize).includes(size)) {
      throw new WOLFAPIError('size is not valid', { size });
    }

    return await this.client.utility.download((await this.client.channel.getById(channelId)).getAvatarUrl(size));
  }
}

export default Channel;

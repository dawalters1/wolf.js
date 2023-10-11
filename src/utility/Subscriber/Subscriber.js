
import PrivilegeUtility from './Privilege.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import validator from '../../validator/index.js';
import IconSize from '../../constants/IconSize.js';

class Subscriber {
  constructor (client) {
    this.client = client;

    this.privilege = new PrivilegeUtility(client);
  }

  /**
   * Get a subscriber avatar
   * @param {Number} subscriberId
   * @param {IconSize} size
   * @returns {Promise<Buffer>}
   */
  async avatar (subscriberId, size) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(size)) {
      throw new WOLFAPIError('size cannot be null or undefined', { size });
    } else if (!Object.values(IconSize).includes(size)) {
      throw new WOLFAPIError('size is not valid', { size });
    }

    return await this.client.utility.download((await this.client.subscriber.getById(subscriberId)).getAvatarUrl(size));
  }
}

export default Subscriber;

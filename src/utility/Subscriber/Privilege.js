import models from '../../models/index.js';
import validator from '../../validator/index.js';
import { Privilege } from '../../constants/index.js';

class PrivilegeUtility {
  constructor (client) {
    this.client = client;
  }

  /**
   * Check if a subscriber has a list of privileges
   * @param {Number} subscriberId
   * @param {Constants.Privilege|Constants.Privilege[]} privileges
   * @param {Boolean} requireAll
   * @returns {Promise<boolean>}
   */
  async has (subscriberId, privileges, requireAll = false) {
    privileges = Array.isArray(privileges) ? privileges : [privileges];

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (!privileges.length) {
      throw new models.WOLFAPIError('subscriberId cannot be any empty array', { privileges });
    }

    if ([...new Set(privileges)].length !== privileges.length) {
      throw new models.WOLFAPIError('privileges cannot contain duplicates', { privileges });
    }

    for (const privilege of privileges) {
      if (validator.isNullOrUndefined(privilege)) {
        throw new models.WOLFAPIError('privilege cannot be null or undefined', { privilege });
      } else if (!validator.isValidNumber(privilege)) {
        throw new models.WOLFAPIError('privilege must be a valid number', { privilege });
      } else if (!Object.values(Privilege).includes(privilege)) {
        throw new models.WOLFAPIError('privilege is not valid', { privilege });
      }
    }

    const subscriber = await this.client.subscriber.getById(subscriberId);

    return requireAll ? privileges.every((priv) => (subscriber.privileges & priv) === priv) : privileges.some((priv) => (subscriber.privileges & priv) === priv);
  }
}

export default PrivilegeUtility;

import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Banned extends Base {
  constructor (client) {
    super(client);
    this.banned = [];
  }

  /**
   * Retrieve the list of banned users for the bot
   * @returns {Promise<Array.<Number>>}
   */
  async list () {
    return this.banned;
  }

  /**
   * Clear the list of banned subscriber IDs
   */
  async clear () {
    this.banned = [];
  }

  /**
   * Check to see if a single user or multiple users are banned by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async isBanned (targetSubscriberIds) {
    const values = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot null or empty', { targetSubscriberIds });
      }

      if ([...new Set(values)].length !== values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot contain duplicates', { targetSubscriberIds });
      }

      for (const subscriberId of values) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
        }
      }
    }

    const results = values.map((subscriberId) => this.banned.includes(subscriberId));

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Ban a single user or multiple users by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async ban (targetSubscriberIds) {
    const values = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot null or empty', { targetSubscriberIds });
      }

      if ([...new Set(values)].length !== values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot contain duplicates', { targetSubscriberIds });
      }

      for (const subscriberId of values) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
        }
      }
    }

    const results = values.reduce((result, subscriberId) => {
      if (this.banned.includes(subscriberId)) {
        result.push(false);
      } else {
        this.banned.push(subscriberId);
        result.push(true);
      }

      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Unban a single user or multiple users by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async unban (targetSubscriberIds) {
    const values = (Array.isArray(targetSubscriberIds) ? targetSubscriberIds : [targetSubscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot be null or empty', { targetSubscriberIds });
      }

      if ([...new Set(values)].length !== values.length) {
        throw new models.WOLFAPIError('targetSubscriberIds cannot contain duplicates', { targetSubscriberIds });
      }

      for (const subscriberId of values) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
        }
      }
    }

    const results = values.reduce((result, subscriberId) => {
      if (!this.banned.includes(subscriberId)) {
        result.push(false);
      } else {
        this.banned = this.banned.filter((banned) => banned !== subscriberId);
        result.push(true);
      }

      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return; }

    this.banned = [];
  }
}

export default Banned;

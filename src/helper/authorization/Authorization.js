import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Authorization extends Base {
  constructor (client) {
    super(client);

    this.authorized = [];
  }

  /**
   * Retrieve the list of authorized subscribers for the bot
   * @returns {Promise<Array.<Number>>}
   */
  async list () {
    return this.authorized;
  }

  /**
   * Clear the list of authorized subscribers
   */
  async clear () {
    this.authorized = [];
  }

  /**
   * Check to see if a single user or multiple subscribers are authorized by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async isAuthorized (targetSubscriberIds) {
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

    const results = values.map((subscriberId) => this.authorized.includes(subscriberId));

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Authorize a single user or multiple subscribers by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async authorize (targetSubscriberIds) {
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
      if (this.authorized.includes(subscriberId)) {
        result.push(false);
      } else {
        this.authorized.push(subscriberId);
        result.push(true);
      }

      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  /**
   * Unauthorize a single user or multiple subscribers by ID
   * @param {Number| Number[]} targetSubscriberIds - The ID or IDs of the subscribers
   * @returns {Promise<Array.<Boolean>|Boolean>}
   */
  async unauthorize (targetSubscriberIds) {
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
      if (!this.authorized.includes(subscriberId)) {
        result.push(false);
      } else {
        this.authorized = this.authorized.filter((authorized) => authorized !== subscriberId);
        result.push(true);
      }

      return result;
    }, []);

    return Array.isArray(targetSubscriberIds) ? results : results[0];
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return; }

    this.authorized = [];
  }
}

export default Authorization;

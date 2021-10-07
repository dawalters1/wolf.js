const validator = require('../../validator');
const constants = require('@dawalters1/constants');

class Privilege {
  constructor (api) {
    this._api = api;
  }

  /**
   * Check to see if a subscriber has a specific privilege or privileges
   * @param {Number} sourceSubscriberId - The ID of the subscriber
   * @param {Number| Array.<Number>} privs - The privilege or privileges
   * @param {Boolean} requireAll - Whether or not the subscriber should have all
   * @returns {Boolean}
   */
  async has (sourceSubscriberId, privs, requireAll = false) {
    privs = validator.isValidArray(privs) ? privs : [privs];

    if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    if (privs.length > 0) {
      for (const priv of privs) {
        if (!validator.isValidNumber(priv)) {
          throw new Error('privs must be a valid number');
        } else if (!Object.values(constants.privilege).includes(priv)) {
          throw new Error('privs is not valid');
        }
      }
    } else {
      throw new Error('privs cannot be any empty array');
    }

    const groupWithSubscriber = (await this._api.group().list()).find((group) => group.subscribers && group.subscribers.some((subscriber) => subscriber.id === sourceSubscriberId));

    let privileges = 0;

    if (groupWithSubscriber) {
      const subscriber = groupWithSubscriber.subscribers.find((subscriber) => subscriber.id === sourceSubscriberId);
      privileges = subscriber.additionalInfo.privileges;
    } else {
      privileges = (await this._api.subscriber().getById(sourceSubscriberId)).privileges;
    }

    return requireAll ? privs.every((priv) => (privileges & priv) === priv) : privs.some((priv) => (privileges & priv) === priv);
  }
}

module.exports = Privilege
;

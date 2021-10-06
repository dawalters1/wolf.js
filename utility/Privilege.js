const validator = require('../../utils/validator');
const constants = require('@dawalters1/constants');

class Privilege {
  constructor (api) {
    this._api = api;
  }

  async has (sourceSubscriberId, privs) {
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

    return privs.some((priv) => (privileges & priv) === priv);
  }
}

module.exports = Privilege
;

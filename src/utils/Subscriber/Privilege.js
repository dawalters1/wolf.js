const validator = require('../../validator');
const constants = require('@dawalters1/constants');

class Privilege {
  constructor (api) {
    this._api = api;
  }

  async has (sourceSubscriberId, privs, requireAll = false) {
    try {
      privs = Array.isArray(privs) ? privs : [privs];

      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }

      if (privs.length === 0) {
        throw new Error('privs cannot be any empty array');
      }
      for (const priv of privs) {
        if (validator.isNullOrUndefined(priv)) {
          throw new Error('priv cannot be null or undefined');
        } else if (!validator.isValidNumber(priv)) {
          throw new Error('priv must be a valid number');
        } else if (validator.isLessThanOrEqualZero(priv)) {
          throw new Error('priv cannot be less than or equal to 0');
        } else if (!Object.values(constants.privilege).includes(priv)) {
          throw new Error('privs is not valid');
        }
      }

      if (!validator.isValidBoolean(requireAll)) {
        throw new Error('requireAll must be a valid boolean');
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
    } catch (error) {
      error.internalErrorMessage = `api.utility().subscriber().privilege().has(sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, privs=${JSON.stringify(privs)}, requireAll=${JSON.stringify(requireAll)})`;
      throw error;
    }
  }
}

module.exports = Privilege
;

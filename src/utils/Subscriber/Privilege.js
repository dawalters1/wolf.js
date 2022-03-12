const validator = require('../../validator');
const { Privilege: Privs } = require('../../constants');

class Privilege {
  constructor (api) {
    this._api = api;
  }

  async has (targetSubscriberId, privs, requireAll = false) {
    try {
      privs = Array.isArray(privs) ? privs : [privs];

      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (!validator.isType(targetSubscriberId, 'number')) {
        throw new Error('targetSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
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
        } else if (!Object.values(Privs).includes(priv)) {
          throw new Error('privs is not valid');
        }
      }

      if (!validator.isValidBoolean(requireAll)) {
        throw new Error('requireAll must be a valid boolean');
      }

      const groupWithSubscriber = (await this._api.group().list()).find((group) => group.subscribers && group.subscribers.some((subscriber) => subscriber.id === targetSubscriberId));

      let privileges = 0;

      if (groupWithSubscriber) {
        const subscriber = groupWithSubscriber.subscribers.find((subscriber) => subscriber.id === targetSubscriberId);
        privileges = subscriber.additionalInfo.privileges;
      } else {
        privileges = (await this._api.subscriber().getById(targetSubscriberId)).privileges;
      }

      return requireAll ? privs.every((priv) => (privileges & priv) === priv) : privs.some((priv) => (privileges & privs) === priv);
    } catch (error) {
      error.internalErrorMessage = `api.utility().subscriber().privilege().has(targetSubscriberId=${JSON.stringify(targetSubscriberId)}, privs=${JSON.stringify(privs)}, requireAll=${JSON.stringify(requireAll)})`;
      throw error;
    }
  }
}

module.exports = Privilege
;

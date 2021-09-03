const BaseUtility = require('../BaseUtility');
const validator = require('../../utils/validator');

const constants = require('@dawalters1/constants');

module.exports = class privilege extends BaseUtility {
  constructor (api) {
    super(api, 'privilege');
  }

  _func () {
    return {
      has: (...args) => this.has(...args)
    };
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
          throw new Error('privilege must be a valid number');
        } else if (!Object.values(constants.privilege).includes(priv)) {
          throw new Error('privilege is not valid');
        }
      }
    }

    const subscriber = await this._api.subscriber().getById(sourceSubscriberId);
    return privs.some((priv) => (subscriber.privileges & priv) === priv);
  }
};

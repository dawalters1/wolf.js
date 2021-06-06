const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');

const constants = require('@dawalters1/constants');

module.exports = class privilege extends BaseUtility {
  constructor (bot) {
    super(bot, 'privilege');
  }

  _func () {
    return {
      has: (...args) => this.has(...args)
    };
  }

  async has (sourceSubscriberId, priv) {
    try {
      if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(priv)) {
        throw new Error('privilege must be a valid number');
      } else if (!Object.values(constants.privilege).includes(priv)) {
        throw new Error('privilege is not valid');
      }

      return (((await this._bot.subscriber().getById(sourceSubscriberId)).privileges & priv) === priv);
    } catch (error) {
      error.method = `Utility/utilties/privilege/has(sourceSubscriberId = ${JSON.stringify(sourceSubscriberId)}, privilege = ${JSON.stringify(priv)})`;
      throw error;
    }
  }
};

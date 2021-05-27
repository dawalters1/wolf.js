const BaseUtility = require('../BaseUtility');
const validator = require('../../utils/validator');

const { privilege } = require('../../constants');

module.exports = class TestUtil extends BaseUtility {
  constructor (bot) {
    super(bot, 'hasPrivilege');
  }

  async _function (...args) {
    const sourceSubscriberId = args[0];

    const priv = args[1];

    if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(priv)) {
      throw new Error('privilege must be a valid number');
    } else if (!Object.values(privilege).includes(priv)) {
      throw new Error('privilege is not valid');
    }

    const subscriber = await this._bot.subscriber().getById(sourceSubscriberId);

    return ((subscriber.privileges & priv) === priv);
  }
};

const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');

module.exports = class Delay extends BaseUtility {
  constructor (bot) {
    super(bot, 'delay');
  }

  _func (duration) {
    if (!validator.isValidNumber(duration)) {
      throw new Error('duration must be a valid number');
    } else if (validator.isLessThanOrEqualZero(duration)) {
      throw new Error('duration cannot be less than or equal to 0');
    }

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }
};

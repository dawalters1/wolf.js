const BaseUtility = require('../BaseUtility');

const validator = require('../../utils/validator');

const replaceAll = (string, fromReplace, toReplace) => string.replace(new RegExp(fromReplace, 'ig'), toReplace);

module.exports = class ReplaceInString extends BaseUtility {
  constructor (bot) {
    super(bot, 'replaceInString');
  }

  _function (...args) {
    const string = args[0];

    const replacements = args[1];

    if (typeof (arg) !== 'string') {
      throw new Error('argument must be a string');
    } else if (validator.isNullOrWhitespace(string)) {
      throw new Error('string cannot be null or empty');
    }

    const mapped = Object.fromEntries(Object.entries(replacements).map(([k, v]) => [k, v]));

    if (mapped.length === 0 || Object.entries(mapped).some((value) => value.length !== 2)) {
      throw new Error('replacements object is invalid');
    }

    return Object.entries(mapped).reduce((result, value) => replaceAll(result, `{${value[0]}}`, value[1]), string);
  }
};

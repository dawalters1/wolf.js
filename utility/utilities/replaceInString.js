const BaseUtility = require('../BaseUtility');

const validator = require('@dawalters1/validator');
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = class ReplaceInString extends BaseUtility {
  constructor (bot) {
    super(bot, 'replaceInString');
  }

  _func (...args) {
    const string = args[0];

    const replacements = args[1];

    if (typeof (string) !== 'string') {
      throw new Error('string must be a string');
    } else if (validator.isNullOrWhitespace(string)) {
      throw new Error('string cannot be null or empty');
    }

    const mapped = Object.fromEntries(Object.entries(replacements).map(([k, v]) => [k, v]));

    if (mapped.length === 0 || Object.entries(mapped).some((value) => value.length !== 2)) {
      throw new Error('replacements object is invalid');
    }
    return Object.entries(mapped).reduce((result, value) => result.replace(new RegExp(escapeRegExp(`{${value[0]}}`), 'g'), value[1].toString()), string);
  }
};

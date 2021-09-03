const BaseUtility = require('../BaseUtility');
const validator = require('../../utils/validator');

function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = class String extends BaseUtility {
  constructor (api) {
    super(api, 'string');
  }

  _func () {
    return {
      replace: (...args) => this.replace(...args),
      isEqual: (...args) => this.isEqual(...args),
      chunk: (...args) => this.chunk(...args)
    };
  }

  replace (string, replacements) {
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

  isEqual (sideA, sideB) {
    if (typeof (sideA) !== 'string') {
      throw new Error('sideA must be a string');
    }

    if (typeof (sideB) !== 'string') {
      throw new Error('sideB must be a string');
    }

    if (sideA === undefined && sideB === undefined) {
      return true;
    }

    if (sideA === undefined || sideB === undefined) {
      return false;
    }

    if (sideA === null && sideB === null) {
      return true;
    }

    if (sideA === null || sideB === null) {
      return false;
    }

    return sideA.toLocaleLowerCase().trim() === sideB.toLocaleLowerCase().trim();
  }

  chunk (string, max = 1000, splitChar = '\n', joinChar = '\n') {
    try {
      if (typeof (string) !== 'string') {
        throw new Error('string must be a string');
      } else if (validator.isNullOrWhitespace(string)) {
        throw new Error('string cannot be null or empty');
      }

      if (!validator.isValidNumber(max)) {
        throw new Error('max must be a valid number');
      } else if (validator.isLessThanOrEqualZero(max)) {
        throw new Error('max cannot be less than or equal to 0');
      }

      if (string.length <= max) {
        return [string];
      }

      if (typeof (splitChar) !== 'string') {
        throw new Error('splitChar must be a string');
      }

      if (typeof (joinChar) !== 'string') {
        throw new Error('joinChar must be a string');
      }

      const lines = string.split(splitChar).filter(Boolean);

      if (lines === 0) {
        throw Error(`string is longer than ${max} characters and contains no ${splitChar} characters`);
      }

      return lines.reduce((result, value) => {
        if (result.length > 0) {
          if (result.slice(-1)[0].length + value.length <= max) {
            result[result.length - 1] = `${result.slice(-1)[0]}${joinChar}${value}`;
            return result;
          }
        }

        result.push(value);
        return result;
      }, []);
    } catch (error) {
      error.method = `Utility/utilties/string/chunk(string = ${JSON.stringify(string)}, max = ${JSON.stringify(max)}, splitChar = ${JSON.stringify(splitChar)}, joinChar = ${JSON.stringify(joinChar)})`;
      throw error;
    }
  };
};

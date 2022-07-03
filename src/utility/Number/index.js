const _ = require('lodash');
const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

class NumberUtility {
  toEnglishNumbers (arg) {
    if (validator.isNullOrUndefined(arg)) {
      throw new WOLFAPIError('arg cannot be null or undefined', { arg });
    }

    arg = arg.toString().replace(/[٠-٩]/g, char => char.charCodeAt(0) - '٠'.charCodeAt(0));
    arg = arg.toString().replace(/[۰-۹]/g, char => char.charCodeAt(0) - '۰'.charCodeAt(0));

    return typeof arg === 'number' ? parseInt(arg) : arg;
  }

  toArabicNumbers (arg) {
    if (validator.isNullOrUndefined(arg)) {
      throw new WOLFAPIError('arg cannot be null or undefined', { arg });
    }

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '٠١٢٣٤٥٦٧٨٩'[char]);
  }

  toPersianNumbers (arg) {
    if (validator.isNullOrUndefined(arg)) {
      throw new WOLFAPIError('arg cannot be null or undefined', { arg });
    }

    return this.toEnglishNumbers(arg).toString().replace(/[0-9]/g, char => '۰۱۲۳۴۵۶۷۸۹'[char]);
  }

  addCommas (arg) {
    if (validator.isNullOrUndefined(arg)) {
      throw new WOLFAPIError('arg cannot be null or undefined', { arg });
    }

    const args = arg.toString().split('.');

    return `${args[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${args[1] ? args[1] : ''}`;
  }

  random (min = 0, max = 1) {
    if (validator.isNullOrUndefined(min)) {
      throw new WOLFAPIError('min cannot be null or undefined', { min });
    } else if (!validator.isValidNumber(min)) {
      throw new WOLFAPIError('min must be a valid number', { min });
    }

    if (validator.isNullOrUndefined(max)) {
      throw new WOLFAPIError('max cannot be null or undefined', { max });
    } else if (!validator.isValidNumber(max)) {
      throw new WOLFAPIError('max must be a valid number', { max });
    }

    if (max < min) {
      throw new WOLFAPIError('Max must be larger than min', { min, max });
    }

    return _.random(min, max);
  }

  clamp (number, lower, upper) {
    if (validator.isNullOrUndefined(number)) {
      throw new WOLFAPIError('number cannot be null or undefined', { number });
    } else if (!validator.isValidNumber(number)) {
      throw new WOLFAPIError('number must be a valid number', { number });
    }

    if (validator.isNullOrUndefined(lower)) {
      throw new WOLFAPIError('lower cannot be null or undefined', { lower });
    } else if (!validator.isValidNumber(lower)) {
      throw new WOLFAPIError('lower must be a valid number', { lower });
    }

    if (validator.isNullOrUndefined(upper)) {
      throw new WOLFAPIError('upper cannot be null or undefined', { upper });
    } else if (!validator.isValidNumber(upper)) {
      throw new WOLFAPIError('upper must be a valid number', { upper });
    }

    if (upper < lower) {
      throw new WOLFAPIError('Upper must be larger than lower', { lower, upper });
    }

    if (_.inRange(number, lower, upper)) {
      throw new WOLFAPIError('Number must be in range of lower and upper', { number, lower, upper });
    }

    return _.clamp(number, lower, upper);
  }
}

module.exports = NumberUtility;

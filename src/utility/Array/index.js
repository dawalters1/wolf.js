import _ from 'lodash';
import validator from '../../validator/index.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';

class ArrayUtility {
  /**
   * Chunk an array
   * @param {Array<*>} array
   * @param {Number} length
   * @returns {Array<Array<*>>}
   */
  chunk (array, length) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('length cannot be null or undefined', { length });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('length must be a valid number', { length });
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new WOLFAPIError('length cannot be less than or equal to 0', { length });
    }

    return _.chunk(array, length);
  }

  /**
   * Shuffle an array
   * @param {Array<*>} array
   * @returns {Array<*>}
   */
  shuffle (array) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    return _.shuffle(array);
  }

  /**
   * Get random item(s) from an array
   * @param {Array<*>} array
   * @param {Number} amount
   * @returns {*}
   */
  getRandom (array, amount = 1) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    if (validator.isNullOrUndefined(amount)) {
      throw new WOLFAPIError('amount cannot be null or undefined', { amount });
    } else if (!validator.isValidNumber(amount)) {
      throw new WOLFAPIError('amount must be a valid number', { amount });
    } else if (validator.isLessThanOrEqualZero(amount)) {
      throw new WOLFAPIError('amount cannot be less than or equal to 0', { amount });
    }

    return amount === 1 ? _.sample(array) : _.sampleSize(array, amount);
  }

  /**
   * Join multiple arrays
   * @param {Array<Array<*>>} arrays
   * @returns {Array<*>}
   */
  join (arrays) {
    if (validator.isNullOrUndefined(arrays)) {
      throw new WOLFAPIError('array cannot be null or undefined', { arrays });
    } else if (!Array.isArray(arrays)) {
      throw new WOLFAPIError('arrays must be type array', { arrays });
    }

    return _.join(arrays);
  }

  /**
   * Reverse the order of an array
   * @param {Array<*>} array
   * @returns {Array<*>}
   */
  reverse (array) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    return _.reverse(array);
  }

  /**
   * Take nth items from the start of an array
   * @param {Array<*>} array
   * @param {Number} length
   * @returns {Array<*>}
   */
  take (array, length) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('length cannot be null or undefined', { length });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('length must be a valid number', { length });
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new WOLFAPIError('length cannot be less than or equal to 0', { length });
    }

    return _.take(array, length);
  }

  /**
   * Check whether an object exists in an array
   * @param {Array<*>} array
   * @param {*} object
   * @returns {boolean}
   */
  includes (array, object) {
    if (validator.isNullOrUndefined(array)) {
      throw new WOLFAPIError('array cannot be null or undefined', { array });
    } else if (!Array.isArray(array)) {
      throw new WOLFAPIError('array must be type array', { array });
    }

    if (validator.isNullOrUndefined(object)) {
      throw new WOLFAPIError('length cannot be null or undefined', { length });
    } else if (typeof object !== 'object') {
      throw new WOLFAPIError('object must be an object', { object });
    }

    return _.includes(array, object);
  }
}

export default ArrayUtility;

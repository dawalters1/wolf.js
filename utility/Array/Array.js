const validator = require('../../validator');

function * chunk (arr, batchSize) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

class Array {
  constructor (api) {
    this._api = api;
  }

  /**
   * Chunk an array in to arrays of specific sizes
   * @param {Array} array - The array you want to chunk
   * @param {Number} length - How many items should be in each array
   * @returns {Array.Array} Chunked array
   */
  chunk (array, length) {
    if (!validator.isValidArray(array)) {
      throw new Error('array must be a valid number');
    } else if (array.length === 0) {
      return [];
    }
    if (!validator.isValidNumber(length)) {
      throw new Error('length must be a valid number');
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new Error('length cannot be less than or equal to 0');
    }

    return chunk(array, length);
  }
}

module.exports = Array;

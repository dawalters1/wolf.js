const validator = require('../validator');

function * chunk (arr, batchSize) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

class Array {
  constructor (api) {
    this._api = api;
  }

  chunk (array, length) {
    if (!validator.isValidArray(array)) {
      throw new Error('array must be a valid number');
    } else if (array.length === 0) {
      throw new Error('array cannot be null or empty');
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

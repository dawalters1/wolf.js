const BaseUtility = require('../BaseUtility');
const validator = require('../../utils/validator');

function * batch (arr, batchSize) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

module.exports = class BatchArray extends BaseUtility {
  constructor (api) {
    super(api, 'batchArray');
  }

  _func (...args) {
    const array = args[0];

    const length = args[1];
    if (!validator.isValidArray(array)) {
      throw new Error('array must be a valid array');
    }

    if (!validator.isValidNumber(length)) {
      throw new Error('length must be a valid number');
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new Error('length cannot be less than or equal to 0');
    }

    if (array.length === 0) {
      return array;
    }

    return batch(array, length);
  }
};

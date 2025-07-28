import _ from 'lodash';
import { validate } from '../validator/index.js';

class ArrayUtility {
  chunk (array, size) {
    { // eslint-disable-line no-lone-blocks
      validate(array)
        .isValidArray(`ArrayUtility.chunk() parameter array: ${array}, must be a valid array`);

      validate(size)
        .isGreaterThan(0, `ArrayUtility.chunk() parameter size: ${size}, must be larger than 0`);
    }

    return _.chunk(array, size);
  }

  shuffle (array) {
    { // eslint-disable-line no-lone-blocks
      validate(array)
        .isValidArray(`ArrayUtility.shuffle() parameter array: ${array}, must be a valid array`);
    }
    return _.shuffle(array);
  }

  choose (array, count = 1) {
    { // eslint-disable-line no-lone-blocks
      validate(array)
        .isValidArray(`ArrayUtility.choose() parameter array: ${array}, must be a valid array`);

      validate(count)
        .isGreaterThan(0, `ArrayUtility.choose() parameter count: ${count}, must be larger than 0`);
    }

    return _.sampleSize(array, count);
  }
}

export default ArrayUtility;

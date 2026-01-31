import _ from 'lodash';
import BaseUtility from './BaseUtility.js';
import { validate } from '../../validation/Validation.js';

export default class ArrayUtility extends BaseUtility {
  chunk (array, size) {
    const normalisedArray = this.normaliseArray(array);
    const normalisedSize = this.normaliseNumber(size);

    validate(array, this, this.choose)
      .isArray();

    validate(normalisedSize, this, this.choose)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return _.chunk(normalisedArray, normalisedSize);
  }

  shuffle (array) {
    const normalisedArray = this.normaliseArray(array);

    validate(array, this, this.choose)
      .isArray();

    return _.shuffle(normalisedArray);
  }

  choose (array, count = 1) {
    const normalisedArray = this.normaliseArray(array);
    const normalisedCount = this.normaliseNumber(count);

    validate(array, this, this.choose)
      .isArray();

    validate(normalisedCount, this, this.choose)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return _.sampleSize(normalisedArray, normalisedCount);
  }
}

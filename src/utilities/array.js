import _ from 'lodash';
import BaseUtility from './BaseUtility.js';

export default class ArrayUtility extends BaseUtility {
  chunk (array, size) {
    const normalisedArray = this.normaliseArray(array);
    const normalisedSize = this.normaliseNumber(size);

    // TODO: validation

    return _.chunk(normalisedArray, normalisedSize);
  }

  shuffle (array) {
    const normalisedArray = this.normaliseArray(array);

    // TODO: validation

    return _.shuffle(normalisedArray);
  }

  choose (array, count = 1) {
    const normalisedArray = this.normaliseArray(array);
    const normalisedCount = this.normaliseNumber(count);

    // TODO: validation

    return _.sampleSize(normalisedArray, normalisedCount);
  }
}

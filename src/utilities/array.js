import _ from 'lodash';
import BaseUtility from './BaseUtility.js';
import { validate } from '../validator/index.js';

export default class ArrayUtility extends BaseUtility {
  chunk (array, size) {
    return _.chunk(array, size);
  }

  shuffle (array) {
    return _.shuffle(array);
  }

  choose (array, count = 1) {
    return _.sampleSize(array, count);
  }
}

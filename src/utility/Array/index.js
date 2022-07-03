const _ = require('lodash');

class ArrayUtility {
  chunk (array, length) {
    return _.chunk(array, length);
  }

  shuffle (array) {
    return _.shuffle(array);
  }

  getRandom (array, amount = 1) {
    return amount === 1 ? _.sample(array) : _.sampleSize(array, amount);
  }

  join (arrays) {
    return _.join(arrays);
  }

  reverse (array) {
    return _.reverse(array);
  }

  take (array, length) {
    return _.take(array, length);
  }

  includes (array, object) {
    return _.includes(array, object);
  }
}

module.exports = ArrayUtility;

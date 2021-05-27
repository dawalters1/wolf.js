const BaseUtility = require('../BaseUtility');

function * batch (arr, batchSize) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

module.exports = class BatchArray extends BaseUtility {
  constructor (bot) {
    super(bot, 'batchArray');
  }

  _function (...args) {
    const arg = args[0];

    const length = args[1];

    return batch(arg, length);
  }
};

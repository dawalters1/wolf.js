function * batch (arr, batchSize) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

module.exports = (arr, batchSize) => batch(arr, batchSize);

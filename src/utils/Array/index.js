
class Array {
  chunk (array, length) {
    if (!array || (array.length === 0 || length === 0)) {
      return array || [];
    }

    return [array.slice(0, length)].concat(this.chunk(array.slice(length), length));
  }
}

module.exports = Array;

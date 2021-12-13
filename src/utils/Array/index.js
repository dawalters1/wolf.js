
class Array {
  chunk (array, length) {
    if (!array || (array.length === 0 || length === 0)) {
      return array || [];
    }

    return [array.slice(0, length)].concat(this.chunk(array.slice(length), length));
  }

  shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [array[i], array[rand]] = [array[rand], array[i]];
    }
    return array;
  }

  getRandomIndex (array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = Array;

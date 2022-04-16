
class _Array {
  chunk (array, length) {
    try {
      array = Array.isArray(array) ? array : [array];

      if (array.length === 0) {
        return [];
      }

      if (!array || (array.length === 0 || length === 0)) {
        return array || [];
      }

      return [array.slice(0, length)].concat(this.chunk(array.slice(length), length));
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.array${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}chunk(array=${JSON.stringify(array)}, length=${JSON.stringify(length)})`;
      throw error;
    }
  }

  shuffle (array) {
    try {
      array = Array.isArray(array) ? array : [array];

      if (array.length === 0) {
        throw new Error('array cannot be an empty array');
      }
      for (let i = array.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]];
      }
      return array;
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.array${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}shuffle(array=${JSON.stringify(array)})`;
      throw error;
    }
  }

  getRandomIndex (array) {
    try {
      array = Array.isArray(array) ? array : [array];

      if (array.length === 0) {
        throw new Error('array cannot be an empty array');
      }
      return array[Math.floor(Math.random() * array.length)];
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.array${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}getRandomIndex(array=${JSON.stringify(array)})`;
      throw error;
    }
  }
}

module.exports = _Array;

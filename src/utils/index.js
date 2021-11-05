class Utility {
  constructor (api) {
    this._api = api;
    this._array = require('./Array/Array');
  }

  array () {
    return this._array;
  }
}

module.exports = Utility;

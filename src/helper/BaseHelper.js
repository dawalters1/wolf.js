const Cache = require('../cache/cache');

const cache = new Cache();

class BaseHelper {
  constructor (api) {
    this._api = api;

    this._websocket = api.websocket;

    this._cache = cache;
  }

  _cleanup () {
    throw new Error('NOT IMPLEMENTED');
  }

  _process (...args) {
    throw new Error('NOT IMPLEMENTED');
  }
}

module.exports = BaseHelper;

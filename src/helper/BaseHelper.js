const Cache = require('../cache');

class BaseHelper {
  constructor (api, useCache = false) {
    this._api = api;

    this._websocket = api.websocket;

    if (useCache) {
      this._cache = new Cache();
    }
  }

  async _cleanup (disconnected = false) {
    throw new Error('NOT IMPLEMENTED');
  }

  _process (...args) {
    throw new Error('NOT IMPLEMENTED');
  }
}

module.exports = BaseHelper;

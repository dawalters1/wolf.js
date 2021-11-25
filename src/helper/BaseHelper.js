class BaseHelper {
  constructor (api) {
    this._api = api;

    this._websocket = api.websocket;
  }

  _cleanup () {
    throw new Error('NOT IMPLEMENTED');
  }

  _process (...args) {
    throw new Error('NOT IMPLEMENTED');
  }
}

module.exports = BaseHelper;

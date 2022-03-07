class BaseHelper {
  constructor (api) {
    this._api = api;

    this._websocket = api.websocket;
  }

  async _cleanup (disconnected = false) {
    throw new Error('NOT IMPLEMENTED');
  }

  _process (...args) {
    throw new Error('NOT IMPLEMENTED');
  }
}

module.exports = BaseHelper;

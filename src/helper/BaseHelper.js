
class BaseHelper {
  constructor (api) {
    this._api = api;
    this._websocket = this._api.websocket;
  }

  _cleanup () {
    throw new Error('NOT IMPLEMENTED');
  }
}

module.exports = BaseHelper;

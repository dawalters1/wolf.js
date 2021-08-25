
module.exports = class Helper {
  constructor (api) {
    this._api = api;
    this._config = this._api.config;
    this._websocket = this._api.websocket;
  }

  _clearCache () { }
};


/**
 * {@hideconstructor}
 */
module.exports = class Helper {
  constructor (api) {
    this._api = api;
    this._websocket = this._api.websocket;
  }

  _clearCache () { }
};

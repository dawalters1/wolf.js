
module.exports = class BaseEvent {
  constructor (eventManager, command) {
    this._api = eventManager._api;
    this._config = this._api.config;
    this._websocket = this._api.websocket;
    this._command = command;
  }

  process (data) {
    return data;
  }
};

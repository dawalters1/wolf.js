
module.exports = class BaseEvent {
  constructor (eventManager, command) {
    this._bot = eventManager._bot;
    this._config = this._bot.config;
    this._websocket = this._bot.websocket;
    this._socketEvents = eventManager._socketEvents;
    this._internalEvents = eventManager._internalEvents;
    this._serverEvents = eventManager._serverEvents;
    this._command = command;
  }

  process (data) {
    return data;
  }
};

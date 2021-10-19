
/**
 * {@hideconstructor}
 */
module.exports = class BaseEvent {
  constructor (eventManager, command) {
    this._api = eventManager._api;
    this._command = command;
  }

  process (data) {
    return data;
  }
};

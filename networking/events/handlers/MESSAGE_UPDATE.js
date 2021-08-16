const BaseEvent = require('../BaseEvent');

module.exports = class MessageUpdate extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, data);
  }
};

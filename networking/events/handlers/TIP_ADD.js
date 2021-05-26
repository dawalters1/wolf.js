
const BaseEvent = require('../BaseEvent');

module.exports = class TipAdd extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, data);
  }
};

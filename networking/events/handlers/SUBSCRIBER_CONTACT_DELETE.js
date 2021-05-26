
const BaseEvent = require('../BaseEvent');

module.exports = class SubscriberContactDelete extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, this._bot.contact()._process(data.id));
  }
};

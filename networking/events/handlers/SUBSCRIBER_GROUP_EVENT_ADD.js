
const BaseEvent = require('../BaseEvent');

module.exports = class SubscriberGroupEventAdd extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, this._bot.event()._subscription(data));
  }
};

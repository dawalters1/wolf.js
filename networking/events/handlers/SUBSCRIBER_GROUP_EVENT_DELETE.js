const BaseEvent = require('../BaseEvent');

/**
 * {@hideconstructor}
 */
module.exports = class SubscriberContactDelete extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, this._api.event()._subscription(data));
  }
};

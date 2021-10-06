const BaseEvent = require('../BaseEvent');

/**
 * {@hideconstructor}
 */
module.exports = class SubscriberBlockAdd extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, this._api.blocked()._process(data.targetId));
  }
};

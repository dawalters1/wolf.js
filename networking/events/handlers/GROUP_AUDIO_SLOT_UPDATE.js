const BaseEvent = require('../BaseEvent');

module.exports = class GroupAudioSlotUpdate extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, this._api.stage()._process(data));
  }
};

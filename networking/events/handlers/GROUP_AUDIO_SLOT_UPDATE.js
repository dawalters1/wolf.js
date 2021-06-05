const BaseEvent = require('../BaseEvent');

module.exports = class GroupAudioSlotUpdate extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, this._bot.stage()._process(data));
  }
};

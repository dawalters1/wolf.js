const BaseEvent = require('../BaseEvent');

module.exports = class GroupEventCreate extends BaseEvent {
  async process (data) {
    this._bot.on._emit(this._command, this._bot.event()._process(await this._bot.event().getById(data.id, true)));
  }
};

const BaseEvent = require('../BaseEvent');

module.exports = class GroupAudioCountUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._bot.group()._groups.find((group) => group.id === data.id);

    if (existing) {
      existing.audioCounts = data;

      this._bot.on._emit(this._command, existing, data);
    }

    return Promise.resolve();
  }
};

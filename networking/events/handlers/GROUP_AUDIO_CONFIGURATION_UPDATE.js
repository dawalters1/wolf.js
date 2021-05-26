const BaseEvent = require('../BaseEvent');

module.exports = class GroupAudioConfigurationUpdate extends BaseEvent {
  async process (data) {
    const group = await this._bot.group().getById(data.id);

    if (group) {
      group.audioConfig = data;

      this._bot.on._emit(this._command, group, data);
    }

    return Promise.resolve();
  }
};

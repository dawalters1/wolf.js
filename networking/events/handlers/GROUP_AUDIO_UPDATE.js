const BaseEvent = require('../BaseEvent');

module.exports = class GroupAudioUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._api.group()._groups.find((group) => group.id === data.id);

    if (existing) {
      existing.audioConfig = data;

      this._api.on._emit(this._command, existing, data);
    }

    return Promise.resolve();
  }
};

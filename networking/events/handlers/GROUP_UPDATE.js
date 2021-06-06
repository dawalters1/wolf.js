const BaseEvent = require('../BaseEvent');

module.exports = class GroupUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._bot.group()._groups.find((group) => group.id === data.id);

    if (existing && existing.hash !== data.hash) {
      this._bot.on._emit(this._command, await this._bot.group().getById(data.id, true));
    }
  }
};

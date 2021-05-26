const BaseEvent = require('../BaseEvent');

module.exports = class GroupUpdate extends BaseEvent {
  async process (data) {
    const group = await this._bot.group().getById(data.id);

    if (group && group.hash !== data.hash) {
      await this._bot.group().getById(data.id, true);

      this._bot.on._emit(this._command, group);
    }
  }
};

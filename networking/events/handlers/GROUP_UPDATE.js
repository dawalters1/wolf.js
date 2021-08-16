const BaseEvent = require('../BaseEvent');

module.exports = class GroupUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._api.group()._groups.find((group) => group.id === data.id);

    if (existing && existing.hash !== data.hash) {
      this._api.on._emit(this._command, await this._api.group().getById(data.id, true));
    }
  }
};

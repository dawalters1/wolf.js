const BaseEvent = require('../BaseEvent');

module.exports = class GroupEventCreate extends BaseEvent {
  async process (data) {
    this._api.on._emit(this._command, this._api.event()._process(await this._api.event().getById(data.id, true)));
  }
};

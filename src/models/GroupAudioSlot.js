const Base = require('./Base');

class GroupAudioSlot extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAudioSlot;

const Base = require('./Base');

class GroupAudioCount extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAudioCount;

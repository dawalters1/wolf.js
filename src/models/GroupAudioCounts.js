const Base = require('./Base');

class GroupAudioCounts extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAudioCounts;

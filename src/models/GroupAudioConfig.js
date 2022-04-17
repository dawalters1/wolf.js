const Base = require('./Base');

class GroupAudioConfig extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAudioConfig;

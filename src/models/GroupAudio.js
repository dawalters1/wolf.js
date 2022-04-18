const Base = require('./Base');

class GroupAudio extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAudio;

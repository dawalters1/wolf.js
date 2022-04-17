const Base = require('./Base');

class GroupAudioRequest extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  // TODO: Methods
}

module.exports = GroupAudioRequest;

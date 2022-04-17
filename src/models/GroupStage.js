const Base = require('./Base');

class GroupStage extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async set () {
    // TODO:
  }
}

module.exports = GroupStage;

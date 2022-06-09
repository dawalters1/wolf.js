const Base = require('./Base');

class GroupMember extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupMember;

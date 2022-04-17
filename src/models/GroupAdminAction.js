const Base = require('./Base');

class GroupAdminAction extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = GroupAdminAction;

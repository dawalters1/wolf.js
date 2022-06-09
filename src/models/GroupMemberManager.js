const Base = require('../helper/Base');

class GroupMemberManager extends Base {
  constructor (client) {
    super(client);

    this._privileged = [];
    this._regular = [];
    this._banned = [];

    this._privilegedFetched = false;
    this._regularFetched = false;
    this._bannedFetched = false;
  }

  _onUpdate (member) {

  }
}

module.exports = GroupMemberManager;

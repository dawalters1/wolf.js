const Base = require('./Base');

class GroupMember extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
    this.capabilities = data.capabilities;
  }
  // TODO: Methods
}
module.exports = GroupMember;

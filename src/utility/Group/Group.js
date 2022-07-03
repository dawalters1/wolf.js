const Base = require('../../models/Base');
const Member = require('./Member');

class Group extends Base {
  constructor (client) {
    super(client);

    this.member = new Member(client);
  }
}

module.exports = Group;

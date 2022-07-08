const Base = require('./Base');

class GroupExtended extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.longDescription = data.longDescription;
    this.discoverable = data.discoverable;
    this.language = data.language;
    this.category = data.category;
    this.advancedAdmin = data.advancedAdmin;
    this.questionable = data.questionable;
    this.locked = data.locked;
    this.closed = data.closed;
    this.passworded = data.passworded;
    this.entryLevel = data.entryLevel;
  }
  // TODO: Methods
}

module.exports = GroupExtended;

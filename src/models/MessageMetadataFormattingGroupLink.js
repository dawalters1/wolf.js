const Base = require('./Base');

class MessageMetadataFormattingGroupLink extends Base {
  constructor (client, data) {
    super(client);

    this.start = data.start;
    this.end = data.end;
    this.groupId = data.groupId;
  }
  // TODO: Methods
}

module.exports = MessageMetadataFormattingGroupLink;

const Base = require('./Base');
const MessageMetadataFormatting = require('./MessageMetadataFormatting');

class MessageMetadata extends Base {
  constructor (client, data) {
    super(client);

    this.formatting = new MessageMetadataFormatting(client, data.formatting);

    this.isDeleted = data.isDeleted;
    this.isEdited = data.isEdited;
    this.isSpam = data.isSpam;
    this.isTipped = data.isTipped;
  }
}

module.exports = MessageMetadata;

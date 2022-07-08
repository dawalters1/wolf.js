const Base = require('./Base');
const MessageMetadataFormattingGroupLink = require('./MessageMetadataFormattingGroupLink');
const MessageMetadataFormattingUrl = require('./MessageMetadataFormattingUrl');

class MessageMetadataFormatting extends Base {
  constructor (client, data) {
    super(client);

    this.grouplinks = data.groupLinks ? data.groupLinks.map((link) => new MessageMetadataFormattingGroupLink(client, link)) : null;

    this.links = data.links ? data.links.map((link) => new MessageMetadataFormattingUrl(client, link)) : null;
  }
}

module.exports = MessageMetadataFormatting;

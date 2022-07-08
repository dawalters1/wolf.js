const Base = require('./Base');

class MessageMetadataFormattingUrl extends Base {
  constructor (client, data) {
    super(client);

    this.start = data.start;
    this.end = data.end;
    this.url = data.url;
  }
}

module.exports = MessageMetadataFormattingUrl;

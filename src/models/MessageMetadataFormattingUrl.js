import Base from './Base.js';

class MessageMetadataFormattingUrl extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.url = data?.url;
  }

  toJSON () {
    return {
      start: this.start,
      end: this.end,
      url: this.url
    };
  }
}

export default MessageMetadataFormattingUrl;

import Base from './Base.js';

class MessageMetadataFormattingUrl extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.url = data?.url;
  }

  async metadata () {
    return await this.client.misc.metadata(this.url);
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

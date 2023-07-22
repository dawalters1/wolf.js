import Base from './Base.js';

class MessageMetadataFormattingUrl extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.url = data?.url;
  }

  /**
   * Get the link metadata
   * @returns {Promise<LinkMetadata>}
   */
  async metadata () {
    return await this.client.misc.metadata(this.url);
  }
}

export default MessageMetadataFormattingUrl;

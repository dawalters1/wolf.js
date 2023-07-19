import Base from './Base.js';

class Link extends Base {
  constructor (client, data) {
    super(client);

    this.start = data.start;
    this.end = data.end;

    this.link = data.link;
  }

  /**
   * Get the link metadata
   * @returns {Promise<LinkMetadata>}
   */
  async metadata () {
    return await this.client.misc.metadata(this.link);
  }
}

export default Link;

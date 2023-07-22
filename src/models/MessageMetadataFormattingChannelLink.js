import Base from './Base.js';

class MessageMetadataFormattingChannelLink extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;

    this.channelId = data?.groupId;
    this.groupId = this.channelId;
  }

  /**
   * Get the group profile
   * @returns {Promise<Channel>}
   */
  async group () {
    return await this.channel();
  }

  /**
   * Get the channel profile
   * @returns {Promise<Channel>}
   */
  async channel () {
    return await this.client.channel.getById(this.channelId);
  }
}

export default MessageMetadataFormattingChannelLink;

import Base from './Base.js';

class MessageMetadataFormattingGroupLink extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;

    this.channelId = data?.groupId;
    this.groupId = this.channelId;
  }

  async group () {
    return await this.channel();
  }

  async channel () {
    return await this.client.channel.getById(this.channelId);
  }
}

export default MessageMetadataFormattingGroupLink;

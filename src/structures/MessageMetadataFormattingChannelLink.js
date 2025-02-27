import Base from './Base.js';

class MessageMetadataFormattingChannelLink extends Base {
  constructor (client, data) {
    super(client);

    this.start = data?.start;
    this.end = data?.end;
    this.channelId = data?.groupId;
  }
}

export default MessageMetadataFormattingChannelLink;

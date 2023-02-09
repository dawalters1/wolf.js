import Base from './Base.js';

class MessageMetadataFormattingGroupLink extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.groupId = data?.groupId;
  }

  async group () {
    return await this.client.group.getById(this.groupId);
  }
}

export default MessageMetadataFormattingGroupLink;

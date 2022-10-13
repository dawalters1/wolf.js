import Base from './Base.js';

class MessageMetadataFormattingGroupLink extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.groupId = data?.groupId;
  }

  toJSON () {
    return {
      start: this.start,
      end: this.end,
      groupId: this.groupId
    };
  }
}

export default MessageMetadataFormattingGroupLink;

import BaseEntity from './baseEntity.js';

export class MessageMetadataFormattingChannelLink extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.start = entity.start;
    this.end = entity.end;
    this.channelId = entity.groupId || null;
  }
}
export default MessageMetadataFormattingChannelLink;

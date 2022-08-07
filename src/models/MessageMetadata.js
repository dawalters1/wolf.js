import Base from './Base.js';
import MessageMetadataFormatting from './MessageMetadataFormatting.js';
class MessageMetadata extends Base {
  constructor (client, data) {
    super(client);
    this.formatting = new MessageMetadataFormatting(client, data?.formatting);
    this.isDeleted = data?.isDeleted;
    this.isEdited = data?.isEdited;
    this.isSpam = data?.isSpam;
    this.isTipped = data?.isTipped;
  }
}
export default MessageMetadata;

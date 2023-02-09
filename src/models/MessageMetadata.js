import Base from './Base.js';
import MessageMetadataFormatting from './MessageMetadataFormatting.js';

class MessageMetadata extends Base {
  constructor (client, data) {
    super(client);
    this.formatting = data?.formatting ? new MessageMetadataFormatting(client, data.formatting) : null;
    this.isDeleted = data?.isDeleted ?? false;
    this.isEdited = data?.isEdited ?? false;
    this.isSpam = data?.isSpam ?? false;
    this.isTipped = data?.isTipped ?? false;
  }
}

export default MessageMetadata;

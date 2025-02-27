import Base from './Base.js';
import MessageEdited from './MessageEdited.js';
import MessageMetadata from './MessageMetadata.js';

class Message extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.sourceUserId = data?.originator?.id;
    this.targetGroupId = data?.recipient?.id;
    this.isChannel = data?.isGroup;
    this.timestamp = data?.timestamp;
    this.mimeType = data?.mimeType;
    this.data = data?.data?.toString()?.trim();
    this.metadata = data?.metadata
      ? new MessageMetadata(client, data.metadata)
      : undefined;
    this.edited = data?.edited
      ? new MessageEdited(client, data.edited)
      : undefined;
  }
}

export default Message;

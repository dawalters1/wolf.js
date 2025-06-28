import MessageEdited from './messageEdited.js';
import MessageMetadata from './messageMetadata.js';

export class Message {
  constructor (client, entity) {
    this.id = entity.id;
    this.flightId = entity.flightId;
    this.sourceUserId = entity.originator ? entity.originator.id : null;
    this.targetChannelId = entity.recipient ? entity.recipient.id : null;
    this.isChannel = entity.isGroup;
    this.timestamp = entity.timestamp;
    this.mimeType = entity.mimeType;
    this.content = entity.data.toString().trim() || '';
    this.Metadata = entity.metadata ? new MessageMetadata(client, entity.metadata) : null;
    this.edited = entity.edited ? new MessageEdited(client, entity.edited) : null;
  }
}

export default Message;

import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import MessageMetadataFormatting, { ServerMessageMetadataFormatting } from './messageMetadataFormatting.ts';

export interface ServerMessageMetadata {
  formatting: ServerMessageMetadataFormatting;
  isEdited?: boolean;
  isSpam?: boolean;
  isTipped?: boolean;
  isDeleted?: boolean;
}

export class MessageMetadata extends Base {
  formatting: MessageMetadataFormatting | null;
  isEdited: boolean;
  isSpam: boolean;
  isTipped: boolean;
  isDeleted: boolean;

  constructor (client: WOLF, data: ServerMessageMetadata) {
    super(client);

    this.formatting = data?.formatting
      ? new MessageMetadataFormatting(client, data.formatting)
      : null;

    this.isDeleted = data.isDeleted || false;
    this.isEdited = data.isEdited || false;
    this.isSpam = data.isSpam || false;
    this.isTipped = data.isTipped || false;
  }
}

export default MessageMetadata;

import BaseEntity from './baseEntity.ts';
import MessageEdited, { ServerMessageEdited } from './messageEdited.ts';
import MessageMetadata, { ServerMessageMetadata } from './messageMetadata.ts';
import { MessageType } from '../constants/MessageType.ts';
import { ServerUserIdHash } from './userIdHash.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerMessage {
  id: number;
  flightId: string;
  originator?: ServerUserIdHash;
  recipient?: ServerUserIdHash
  isGroup: boolean;
  timestamp: number;
  mimeType: MessageType;
  data: string;
  metadata?: ServerMessageMetadata;
  edited?: ServerMessageEdited;
}

export class Message extends BaseEntity {
  id: number;
  flightId: string;
  sourceUserId: number | null;
  targetChannelId: number | null;
  isChannel: boolean;
  timestamp: number;
  mimeType: MessageType;
  content: string;
  metadata: MessageMetadata | null;
  edited: MessageEdited | null;

  constructor (client: WOLF, data: ServerMessage) {
    super(client);

    this.id = data.id;
    this.flightId = data.flightId;
    this.sourceUserId = data.originator?.id ?? null;
    this.targetChannelId = data.recipient?.id ?? null;
    this.isChannel = data.isGroup;
    this.timestamp = data.timestamp;
    this.mimeType = data.mimeType;
    this.content = data.data?.toString()?.trim() ?? '';
    this.metadata = data?.metadata
      ? new MessageMetadata(client, data.metadata)
      : null;
    this.edited = data?.edited
      ? new MessageEdited(client, data.edited)
      : null;
  }
}

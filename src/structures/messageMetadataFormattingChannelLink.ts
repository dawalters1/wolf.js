import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerMessageMetadataFormattingChannelLink {
    start: number;
    end: number;
    groupId?: number
}

export class MessageMetadataFormattingChannelLink extends Base {
  start: number;
  end: number;
  channelId: number | null;

  constructor (client: WOLF, data: ServerMessageMetadataFormattingChannelLink) {
    super(client);
    this.start = data.start;
    this.end = data.end;
    this.channelId = data?.groupId || null;
  }
}

export default MessageMetadataFormattingChannelLink;

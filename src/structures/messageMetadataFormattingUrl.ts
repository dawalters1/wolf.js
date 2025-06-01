import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerMessageMetadataFormattingUrl {
  start: number;
  end: number;
  url: string;
}

export class MessageMetadataFormattingUrl extends BaseEntity {
  start: number;
  end: number;
  url: string;

  constructor (client: WOLF, data: ServerMessageMetadataFormattingUrl) {
    super(client);
    this.start = data.start;
    this.end = data.end;
    this.url = data.url;
  }
}
export default MessageMetadataFormattingUrl;

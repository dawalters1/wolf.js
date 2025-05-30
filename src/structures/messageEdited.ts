import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerMessageEdited {
  subscriberId: number;
  timestamp: number
}

export class MessageEdited extends Base {
  userId: number;
  timestamp: number;

  constructor (client: WOLF, data: ServerMessageEdited) {
    super(client);

    this.userId = data.subscriberId;
    this.timestamp = data.timestamp;
  }
}

export default MessageEdited;

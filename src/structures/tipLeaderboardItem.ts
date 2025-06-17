import BaseEntity from './baseEntity';
import IdHash, { ServerIdHash } from './idHash';
import WOLF from '../client/WOLF';

export type ServerTipLeaderboardItem = {
    rank: number;
    charmId: number;
    quantity: number;
    credits: number;
    group?: ServerIdHash;
    subscriber?: ServerIdHash
}

export class TipLeaderboardItem extends BaseEntity {
  rank: number;
  charmId: number;
  quantity: number;
  credits: number;
  channel: IdHash | null;
  user: IdHash | null;

  constructor (client: WOLF, data: ServerTipLeaderboardItem) {
    super(client);

    this.rank = data.rank;
    this.charmId = data.charmId;
    this.quantity = data.quantity;
    this.credits = data.credits;
    this.channel = data?.group ? new IdHash(this.client, data.group, true) : null;
    this.user = data?.subscriber ? new IdHash(this.client, data.subscriber) : null;
  }
}

export default TipLeaderboardItem;

import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerCharmSummary {
  charmId: number;
  expireTime: Date | null;
  giftCount: number;
  total: number
}

export class CharmSummary extends Base {
  charmId: number;
  expireTime: Date | null;
  giftCount: number;
  total: number;

  constructor (client: WOLF, data: ServerCharmSummary) {
    super(client);

    this.charmId = data.charmId;
    this.expireTime = data?.expireTime;
    this.giftCount = data.giftCount;
    this.total = data.total;
  }
}

export default CharmSummary;

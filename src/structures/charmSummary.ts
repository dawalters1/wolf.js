import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF.ts';

export interface ServerCharmSummary {
  charmId: number;
  expireTime: Date | null;
  giftCount: number;
  total: number
}

export class CharmSummary extends BaseEntity {
  @key
    charmId: number;

  expireTime: Date | null;
  giftCount: number;
  total: number;

  constructor (client: WOLF, data: ServerCharmSummary) {
    super(client);

    this.charmId = data.charmId;
    this.expireTime = data?.expireTime
      ? new Date(data.expireTime)
      : null;
    this.giftCount = data.giftCount;
    this.total = data.total;
  }

  patch (entity: any): this {
    return this;
  }
}

export default CharmSummary;

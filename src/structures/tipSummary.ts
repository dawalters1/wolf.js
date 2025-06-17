import BaseEntity from './baseEntity';
import TipCharm, { ServerTipCharm } from './tipCharm';
import WOLF from '../client/WOLF';

export type ServerTipSummary = {
    id: number;
    charmList: ServerTipCharm[];
    version: number;
}

export class TipSummary extends BaseEntity {
  id: number;
  list: Set<TipCharm> = new Set();
  version: number;

  constructor (client: WOLF, data: ServerTipSummary) {
    super(client);

    this.id = data.id;
    data.charmList?.map((tipCharm) => this.list.add(new TipCharm(this.client, tipCharm)));
    this.version = data.version;
  }
}

export default TipSummary;

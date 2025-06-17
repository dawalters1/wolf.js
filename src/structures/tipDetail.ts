import BaseEntity from './baseEntity';
import TipCharm, { ServerTipCharm } from './tipCharm';
import WOLF from '../client/WOLF';

export type ServerTipDetail = {

    id: number;
    list: ServerTipCharm[];
    version: number;
}

export class TipDetail extends BaseEntity {
  id: number;
  list: Set<TipCharm> = new Set();
  version: number;

  constructor (client: WOLF, data: ServerTipDetail) {
    super(client);

    this.id = data.id;
    data.list?.map((tipCharm) => this.list.add(new TipCharm(this.client, tipCharm)));
    this.version = data.version;
  }
}

export default TipDetail;

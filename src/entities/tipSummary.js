import BaseEntity from './baseEntity.js';
import TipCharm from './tipCharm.js';

export class TipSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.list = new Set();
    entity.charmList?.forEach(tipCharm => this.list.add(new TipCharm(this.client, tipCharm)));
    this.version = entity.version;
  }
}

export default TipSummary;

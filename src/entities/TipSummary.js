import BaseEntity from './BaseEntity.js';
import TipCharm from './TipCharm.js';

export default class TipSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.list = new Set(entity.charmList?.map((tipCharm) => new TipCharm(this.client, tipCharm)));
    this.version = entity.version;
  }
}

import BaseEntity from './BaseEntity.js';
import TipCharm from './TipCharm.js';

export default class TipDetail extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.list = new Set();
    entity.list?.forEach((tipCharm) => this.list.add(new TipCharm(this.client, tipCharm)));
    this.version = entity.version;
  }
}

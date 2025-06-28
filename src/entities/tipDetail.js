import BaseEntity from './baseEntity.js';
import TipCharm from './tipCharm.js';

export class TipDetail extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.list = new Set();
    entity.list?.forEach(tipCharm => this.list.add(new TipCharm(this.client, tipCharm)));
    this.version = entity.version;
  }
}

export default TipDetail;

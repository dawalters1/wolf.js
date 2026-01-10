import BaseEntity from './baseEntity.js';

export class ChannelOwner extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.hash = entity.hash;
  }
}
export default ChannelOwner;

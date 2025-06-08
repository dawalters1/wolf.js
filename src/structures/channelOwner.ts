import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerChannelOwner {
  id: number;
  hash: string;
}

export class ChannelOwner extends BaseEntity {
  id: number;
  hash: string;

  constructor (client: WOLF, data: ServerChannelOwner) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
  }

  patch (entity: ServerChannelOwner): this {
    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }
}
export default ChannelOwner;

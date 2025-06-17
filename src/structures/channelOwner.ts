import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export type ServerGroupOwner = {
  id: number;
  hash: string;
}

export class ChannelOwner extends BaseEntity {
  id: number;
  hash: string;

  constructor (client: WOLF, data: ServerGroupOwner) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
  }

  patch (entity: ServerGroupOwner): this {
    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }
}
export default ChannelOwner;

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

  patch (entity: any): this {
    return this;
  }
}
export default ChannelOwner;

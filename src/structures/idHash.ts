import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export type ServerIdHash = {
  id: number;
  hash: string
}

export class IdHash extends BaseEntity {
  id: number;
  hash: string;
  isChannel: boolean = false;

  constructor (client: WOLF, data: ServerIdHash, isChannel: boolean = false) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
    this.isChannel = isChannel;
  }

  patch (entity: ServerIdHash): this {
    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }
}

export default IdHash;

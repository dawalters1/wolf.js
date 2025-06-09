import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerIdHash {
  id: number;
  hash: string
}

export class IdHash extends BaseEntity {
  id: number;
  hash: string;

  constructor (client: WOLF, data: ServerIdHash) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
  }

  patch (entity: ServerIdHash): this {
    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }
}

export default IdHash;

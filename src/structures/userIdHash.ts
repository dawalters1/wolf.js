import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerUserIdHash {
  id: number;
  hash: string
}

export class UserIdHash extends BaseEntity {
  id: number;
  hash: string;

  constructor (client: WOLF, data: ServerUserIdHash) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
  }

  patch (entity: ServerUserIdHash): this {
    this.id = entity.id;
    this.hash = entity.hash;

    return this;
  }
}

export default UserIdHash;

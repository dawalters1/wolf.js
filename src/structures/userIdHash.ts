import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerUserIdHash {
    id: number;
    hash: string
}

export class UserIdHash extends Base {
  id: number;
  hash: string;

  constructor (client: WOLF, data: ServerUserIdHash) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
  }
}

export default UserIdHash;

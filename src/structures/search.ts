import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerSearch = {
    id: number;
    hash: string;
    type: string;
    reason: string;
}

export class Search extends BaseEntity {
  id: number;
  hash: string;
  type: string;
  reason: string;

  constructor (client: WOLF, data: ServerSearch) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
    this.type = data.type;
    this.reason = data.reason;
  }
}

export default Search;

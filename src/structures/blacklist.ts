import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';

export type ServerBlacklist = {
    id: number;
    regex: string;
}

export class Blacklist extends BaseEntity {
    @key
      id: number;

    regex: string;

    constructor (client: WOLF, data: ServerBlacklist) {
      super(client);
      this.id = data.id;
      this.regex = data.regex;
    }
}

export default Blacklist;

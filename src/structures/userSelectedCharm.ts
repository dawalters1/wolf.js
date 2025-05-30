import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerUserSelectedCharm {
  charmId: number;
  position: number;
}

export class UserSelectedCharm extends Base {
  charmId: number;
  position: number;

  constructor (client: WOLF, data: ServerUserSelectedCharm) {
    super(client);

    this.charmId = data.charmId;
    this.position = data.position;
  }
}

export default UserSelectedCharm;

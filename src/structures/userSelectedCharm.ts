import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerUserSelectedCharm {
  charmId: number;
  position: number;
}

export class UserSelectedCharm extends BaseEntity {
  charmId: number;
  position: number;

  constructor (client: WOLF, data: ServerUserSelectedCharm) {
    super(client);

    this.charmId = data.charmId;
    this.position = data.position;
  }
}

export default UserSelectedCharm;

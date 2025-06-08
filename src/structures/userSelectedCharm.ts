import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

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

  patch (entity: ServerUserSelectedCharm): this {
    this.charmId = entity.charmId;
    this.position = entity.position;

    return this;
  }
}

export default UserSelectedCharm;

import BaseEntity from './baseEntity.ts';
import UserSelectedCharm, { ServerUserSelectedCharm } from './userSelectedCharm.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerUserSelectedCharmList {
  selectedList: ServerUserSelectedCharm[]
}

export class UserSelectedCharmList extends BaseEntity {
  selectedList: UserSelectedCharm[];

  constructor (client: WOLF, data: ServerUserSelectedCharmList) {
    super(client);

    this.selectedList = data.selectedList.map((selectedCharm) => new UserSelectedCharm(client, selectedCharm));
  }

  patch (entity: any): this {
    return this;
  }
}

export default UserSelectedCharmList;

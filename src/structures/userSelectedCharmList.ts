import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import UserSelectedCharm, { ServerUserSelectedCharm } from './userSelectedCharm.ts';

export interface ServerUserSelectedCharmList {
  selectedList: ServerUserSelectedCharm[]
}

export class UserSelectedCharmList extends Base {
  selectedList: UserSelectedCharm[];

  constructor (client: WOLF, data: ServerUserSelectedCharmList) {
    super(client);

    this.selectedList = data.selectedList?.map((selectedCharm) => new UserSelectedCharm(client, selectedCharm));
  }
}

export default UserSelectedCharmList;

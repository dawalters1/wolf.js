import BaseEntity from './baseEntity.js';
import UserSelectedCharm from './userSelectedCharm.js';

export class UserSelectedCharmList extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.selectedList = entity.selectedList.map(charm => new UserSelectedCharm(client, charm));
  }

  patch (entity) {
    this.selectedList = entity.selectedList.map(charm => new UserSelectedCharm(this.client, charm));
    return this;
  }
}

export default UserSelectedCharmList;

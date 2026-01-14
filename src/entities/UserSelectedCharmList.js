import BaseEntity from './BaseEntity.js';
import UserSelectedCharm from './UserSelectedCharm.js';

export default class UserSelectedCharmList extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.selectedList = new Set(entity.selectedList.map(charm => new UserSelectedCharm(client, charm)));
  }
}

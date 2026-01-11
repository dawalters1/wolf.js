import BaseEntity from './BaseEntity.js';
import IconInfo from './IconInfo.js';
import UserExtended from './UserExtended.js';
import UserPrivilege from '../constants/UserPrivilege.js';
import UserSelectedCharmList from './UserSelectedCharmList.js';

export default class User extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.categoryIds = entity.categoryIds;
    this.charms = new UserSelectedCharmList(client, entity.charms);
    this.extended = entity.extended
      ? new UserExtended(client, entity.extended)
      : null;
    this.followable = entity.followable;
    this.hash = entity.hash;
    this.icon = entity.icon;
    this.iconHash = entity.iconHash;
    this.iconInfo = entity.iconInfo
      ? new IconInfo(client, entity.iconInfo, 'user')
      : null;
    this.nickname = entity.nickname;
    this.privileges = entity.privileges;
    this.privilegeList = Object.values(UserPrivilege).filter(
      (value) => (this.privileges & value) === value
    );
    this.reputation = entity.reputation;
    this.status = entity.status;
  }
}

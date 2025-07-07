import BaseEntity from './baseEntity.js';
import CacheManager from '../managers/cacheManager.js';
import ExpiringProperty from '../managers/expiringProperty.js';
import IconInfo from './iconInfo.js';
import UserExtended from './userExtended.js';
import UserPresence from './userPresence.js';
import { UserPrivilege } from '../constants/index.js';
import UserSelectedCharmList from './userSelectedCharmList.js';

export class User extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.categoryIds = entity.categoryIds;
    this.charms = new UserSelectedCharmList(client, entity.charms);
    this.extended = entity.extended ? new UserExtended(client, entity.extended) : null;
    this.followable = entity.followable;
    this.hash = entity.hash;
    this.icon = entity.icon;
    this.iconHash = entity.iconHash;
    this.iconInfo = entity.iconInfo
      ? new IconInfo(client, entity.iconInfo)
      : null;
    this.id = entity.id;
    this.nickname = entity.nickname;
    this.privileges = entity.privileges;
    this.privilegeList = Object.values(UserPrivilege).filter(
      (value) => (this.privileges & value) === value
    );
    this.reputation = entity.reputation;
    this.status = entity.status;

    this._charmSummary = new CacheManager(60);
    this._charmStatistics = new ExpiringProperty(300);
    this._wolfstars = new ExpiringProperty(60);
    this._achievements = new CacheManager(10);
    this._roles = new ExpiringProperty(60);

    this._presence = new UserPresence(client, entity);
  }

  async achievements (parentId) {
    return this.client.achievement.user.get(this.id, parentId);
  }

  async charmSummary () {
    return this.client.charm.getUserSummary(this.id);
  }

  async charmStatistics () {
    return this.client.charm.getUserStatistics(this.id);
  }

  async presence () {
    return this.client.user.presence.getById(this.id);
  }

  async wolfstarsProfile () {
    return this.client.user.wolfstar.getById(this.id);
  }

  patch (entity) {
    return this;
  }
}

export default User;

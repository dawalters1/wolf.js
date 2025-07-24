import BaseEntity from './baseEntity.js';
import CacheManager from '../managers/cacheManager.js';
import ExpiringProperty from '../managers/expiringProperty.js';
import IconInfo from './iconInfo.js';
import { Language, UserFollowerType, UserPrivilege } from '../constants/index.js';
import UserExtended from './userExtended.js';
import UserPresence from './userPresence.js';
import UserSelectedCharmList from './userSelectedCharmList.js';

export class User extends BaseEntity {
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
      ? new IconInfo(client, entity.iconInfo)
      : null;
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

    this._follow = {
      follower: {
        count: new ExpiringProperty(15)
      },
      following: {
        count: new ExpiringProperty(15)
      }
    };

    this.language = client.utility.toLanguageKey(this?.extended?.language ?? Language.ENGLISH);
  }

  async follow () {
    return this.client.user.followers.follow(this.id);
  }

  async unfollow () {
    return this.client.user.followers.unfollow(this.id);
  }

  async getFollowerCount () {
    return this.client.user.followers.count(this.id, UserFollowerType.FOLLOWER);
  }

  async getFollowingCount () {
    return this.client.user.followers.count(this.id, UserFollowerType.FOLLOWING);
  }

  async getAchievements (parentId) {
    return this.client.achievement.user.get(this.id, parentId);
  }

  async getCharmSummary () {
    return this.client.charm.getUserSummary(this.id);
  }

  async getCharmStatistics () {
    return this.client.charm.getUserStatistics(this.id);
  }

  async getPresence () {
    return this.client.user.presence.getById(this.id);
  }

  async getWOLFStarsProfile () {
    return this.client.user.wolfstar.getById(this.id);
  }

  async sendPrivateMessage (content, opts) {
    return this.client.messaging.sendPrivateMessage(this.id, content, opts);
  }

  /** @internal */
  patch (entity) {
    return this;
  }
}

export default User;

import BaseEntity from './baseEntity.js';
import BaseExpireProperty from '../caching/BaseExpireProperty.js';
import BaseStore from '../caching/BaseStore.js';
import FollowStore from '../caching/FollowStore.js';
import IconInfo from './iconInfo.js';
import { Language, UserFollowerType, UserPrivilege } from '../constants/index.js';
import UserExtended from './userExtended.js';
import UserPresence from './userPresence.js';
import UserSelectedCharmList from './userSelectedCharmList.js';

export class User extends BaseEntity {
  #charmSummaryStore;
  #charmStatisticsStore;
  #wolfstarStore;
  #achievementStore;
  #roleStore;
  #presenceStore;
  #followStore;

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

    this.#charmSummaryStore = new BaseStore({ ttl: 60 });
    this.#charmStatisticsStore = new BaseExpireProperty({ ttl: 300 });
    this.#wolfstarStore = new BaseExpireProperty({ ttl: 60 });
    this.#achievementStore = new BaseStore({ ttl: 10 });
    this.#roleStore = new BaseStore({ ttl: 60 });
    this.#presenceStore = new UserPresence(client, entity, false);
    this.#followStore = new FollowStore();

    this.language = client.utility.toLanguageKey(
      this?.extended?.language ?? Language.ENGLISH
    );
  }

  /** @internal */
  get charmSummaryStore () {
    return this.#charmSummaryStore;
  }

  /** @internal */
  get charmStatisticsStore () {
    return this.#charmStatisticsStore;
  }

  /** @internal */
  get wolfstarStore () {
    return this.#wolfstarStore;
  }

  /** @internal */
  get achievementStore () {
    return this.#achievementStore;
  }

  /** @internal */
  get roleStore () {
    return this.#roleStore;
  }

  /** @internal */
  get presenceStore () {
    return this.#presenceStore;
  }

  /** @internal */
  get followStore () {
    return this.#followStore;
  }

  // === Public methods ===
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

  async getAchievements (parentId, opts) {
    return this.client.achievement.user.get(this.id, parentId, opts);
  }

  async getCharmSummary (opts) {
    return this.client.charm.getUserSummary(this.id, opts);
  }

  async getCharmStatistics (opts) {
    return this.client.charm.getUserStatistics(this.id, opts);
  }

  async getPresence (opts) {
    return this.client.user.presence.getById(this.id, opts);
  }

  async getWOLFStarsProfile (opts) {
    return this.client.user.wolfstar.getById(this.id, opts);
  }

  async sendPrivateMessage (content, opts) {
    return this.client.messaging.sendPrivateMessage(this.id, content, opts);
  }

  async getRoles (opts) {
    return this.client.user.role.getById(this.id, opts);
  }
}

export default User;

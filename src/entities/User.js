import AvatarType from '../constants/AvatarType.js';
import BaseEntity from './BaseEntity.js';
import Cache from '../cache/Cache.js';
import IconInfo from './IconInfo.js';
import PropertyCache from '../cache/PropertyCache.js';
import UserExtended from './UserExtended.js';
import UserFrame from './UserFrame.js';
import UserPresence from './UserPresence.js';
import UserPrivilege from '../constants/UserPrivilege.js';
import UserSelectedCharmList from './UserSelectedCharmList.js';

export default class User extends BaseEntity {
  #achievementStore = new Cache({ ttl: 15 });
  #charmSummaryStore = new Cache({ ttl: 15 });
  #charmStatisticsStore = new PropertyCache({ ttl: 15 });
  #frameSummaryStore = new Cache({ ttl: 15 });
  #presenceStore = new PropertyCache();
  #roleStore = new Cache({ ttl: 15 });
  #wolfStarStore = new PropertyCache({ ttl: 15 });

  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.categoryIds = entity.categoryIds;
    this.charms = new UserSelectedCharmList(client, entity.charms);
    this.extended = entity.extended
      ? new UserExtended(client, entity.extended)
      : null;
    this.frame = entity.frame
      ? new UserFrame(client, entity.frame)
      : null;
    this.followable = entity.followable;
    this.hash = entity.hash;
    this.icon = entity.icon;
    this.iconHash = entity.iconHash;
    this.iconInfo = entity.iconInfo
      ? new IconInfo(client, entity.iconInfo, AvatarType.USER)
      : null;
    this.nickname = entity.nickname;
    this.privileges = entity.privileges;
    this.privilegeList = Object.values(UserPrivilege).filter(
      (value) => (this.privileges & value) === value
    );
    this.reputation = entity.reputation;
    this.status = entity.status;
    this.#presenceStore.value = new UserPresence(this.client, this);
  }

  get achievementStore () {
    return this.#achievementStore;
  }

  get charmStatisticsStore () {
    return this.#charmStatisticsStore;
  };

  get charmSummaryStore () {
    return this.#charmSummaryStore;
  };

  get frameSummaryStore () {
    return this.#frameSummaryStore;
  };

  get presenceStore () {
    return this.#presenceStore;
  }

  get roleStore () {
    return this.#roleStore;
  }

  get wolfStarStore () {
    return this.#wolfStarStore;
  }

  async getAchievements (parentId, opts) {
    return this.client.achievement.user.fetch(this.id, parentId, opts);
  }

  async getCharmSummary (opts) {
    return this.client.charm.summary(this.id, opts);
  }

  async getCharmStatistics (opts) {
    return this.client.charm.statistics(this.id, opts);
  }

  async getPresence (opts) {
    return this.client.user.presence.fetch(this.id, opts);
  }

  async getWOLFStarsProfile (opts) {
    return this.client.user.wolfstar.fetch(this.id, opts);
  }

  async sendPrivateMessage (content, opts) {
    return this.client.messaging.sendPrivateMessage(this.id, content, opts);
  }

  async getRoles (opts) {
    return this.client.user.role.fetch(this.id, opts);
  }
}

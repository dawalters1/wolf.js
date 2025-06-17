import AchievementUser from './achievementUser.ts';
import BaseEntity from './baseEntity.ts';
import CacheManager from '../managers/cacheManager.ts';
import CharmStatistic from './charmStatistic.ts';
import CharmSummary from './charmSummary.ts';
import { DeviceType, UserPrivilege, UserPresence as UserPresenceType } from '../constants/index.ts';
import ExpiringProperty from '../managers/expiringProperty';
import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { key } from '../decorators/key.ts';
import UserExtended, { ServerUserExtended } from './userExtended.ts';
import UserPresence from './userPresence.ts';
import UserRole from './userRole';
import UserSelectedCharmList, { ServerUserSelectedCharmList } from './userSelectedCharmList.ts';
import WOLF from '../client/WOLF.ts';
import WOLFStar from './wolfstar';

export type ServerUser = {
  categoryIds: number[];
  charms: ServerUserSelectedCharmList;
  deviceType: DeviceType;
  extended?: ServerUserExtended;
  followable: boolean;
  hash: string;
  icon: number;
  iconHash: string;
  iconInfo: ServerIconInfo;
  id: number;
  nickname: string;
  onlineState: UserPresenceType;
  privileges: UserPrivilege;
  reputation: number;
  status: string;
}

export class User extends BaseEntity {
  @key
    id: number;

  categoryIds: number[];
  charms: UserSelectedCharmList;
  extended: UserExtended | null;
  followable: boolean;
  hash: string;
  icon: number;
  iconHash: string;
  iconInfo: IconInfo;
  nickname: string;
  privileges: UserPrivilege;
  privilegeList: UserPrivilege[];
  reputation: number;
  status: string;

  // #region TTL'd properties
  _charmSummary: CacheManager<CharmSummary> = new CacheManager(60);
  _charmStatistics: ExpiringProperty<CharmStatistic> = new ExpiringProperty(300);
  _wolfstars: ExpiringProperty<WOLFStar> = new ExpiringProperty(60);
  _achievements: CacheManager<AchievementUser> = new CacheManager(10);
  _roles: ExpiringProperty<UserRole> = new ExpiringProperty(60);
  // #endregion

  // #region Subscription properties
  _presence: UserPresence;
  // #endregion

  constructor (client: WOLF, data: ServerUser) {
    super(client);

    this.categoryIds = data.categoryIds;
    this.charms = new UserSelectedCharmList(client, data.charms);
    this.extended = data.extended
      ? new UserExtended(client, data.extended)
      : null;
    this.followable = data.followable;
    this.hash = data.hash;
    this.icon = data.icon;
    this.iconHash = data.iconHash;
    this.iconInfo = new IconInfo(client, data.iconInfo);
    this.id = data.id;
    this.nickname = data.nickname;
    this.privileges = data.privileges;
    this.privilegeList = Object.values(UserPrivilege)
      .filter((value): value is UserPrivilege => (this.privileges & value as number) === value);
    this.reputation = data.reputation;
    this.status = data.status;
    this._presence = new UserPresence(client, data);
  }

  async achievements (parentId?: number) {
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

  patch (entity: any): this {
    return this;
  }
}

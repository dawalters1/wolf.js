import AchievementUser from './achievementUser.ts';
import BaseEntity from './baseEntity.ts';
import CacheManager from '../managers/cacheManager.ts';
import CharmStatistic from './charmStatistic.ts';
import CharmSummary from './charmSummary.ts';
import { DeviceType, UserPrivilege } from '../constants/index.ts';
import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { key } from '../decorators/key.ts';
import UserExtended, { ServerUserExtended } from './userExtended.ts';
import UserPresence from './userPresence.ts';
import UserSelectedCharmList, { ServerUserSelectedCharmList } from './userSelectedCharmList.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerUser {
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
  onlineState: UserPresence;
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
  charmSummary: CacheManager<CharmSummary>;
  charmStatistics: CharmStatistic;
  achievements: CacheManager<AchievementUser>;
  presence: UserPresence;

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
    this.charmSummary = new CacheManager();
    this.charmStatistics = new CharmStatistic(client);
    this.achievements = new CacheManager();
    this.presence = new UserPresence(client, data);
  }
}

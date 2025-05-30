import IconInfo, { ServerIconInfo } from './iconInfo.ts';
import { DeviceType, UserPresence, UserPrivilege } from '../constants/index.ts';
import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';
import UserExtended, { ServerUserExtended } from './userExtended.ts';
import UserSelectedCharmList, { ServerUserSelectedCharmList } from './userSelectedCharmList.ts';
import CharmStatistic from './charmStatistic.ts';
import CacheManager from '../managers/cacheManager.ts';
import CharmSummary from './charmSummary.ts';
import { key } from '../decorators/key.ts';

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
  deviceType: DeviceType;
  extended: UserExtended | null;
  followable: boolean;
  hash: string;
  icon: number;
  iconHash: string;
  iconInfo: IconInfo;
  nickname: string;
  onlineState: UserPresence;
  privileges: UserPrivilege;
  reputation: number;
  status: string;
  charmSummary: CacheManager<CharmSummary>;
  charmStatistics: CharmStatistic;

  constructor (client: WOLF, data: ServerUser) {
    super(client);

    this.categoryIds = data.categoryIds;
    this.charms = new UserSelectedCharmList(client, data.charms);
    this.deviceType = data.deviceType;
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
    this.onlineState = data.onlineState;
    this.privileges = data.privileges;
    this.reputation = data.reputation;
    this.status = data.status;
    this.charmSummary = new CacheManager();
    this.charmStatistics = new CharmStatistic(client);
  }
}

import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerGroupStatsOwner = {
    level: number;
    nickname: string;
    subId: number;
}

export class ChannelStatsOwner extends BaseEntity {
  level: number;
  nickname: string;
  userId: number;

  constructor (client: WOLF, data: ServerGroupStatsOwner) {
    super(client);

    this.level = data.level;
    this.nickname = data.nickname;
    this.userId = data.subId;
  }
}

export default ChannelStatsOwner;

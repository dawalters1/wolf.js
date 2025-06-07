import AchievementChannelAdditionalInfo, { ServerAchievementChannelAdditionalInfo } from './achievementChannelAdditionalInfo.ts';
import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerAchievementChannel {
  id: number;
  additionalInfo: ServerAchievementChannelAdditionalInfo
}

export class AchievementChannel extends BaseEntity {
  @key
    id: number;

  additionalInfo: AchievementChannelAdditionalInfo;
  childrenId?: Set<number>;

  constructor (client: WOLF, data: ServerAchievementChannel) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new AchievementChannelAdditionalInfo(client, data.additionalInfo);
  }

  patch (entity: any): this {
    return this;
  }
}

export default AchievementChannel;

import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import AchievementChannelAdditionalInfo, { ServerAchievementChannelAdditionalInfo } from './achievementChannelAdditionalInfo.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerAchievementChannel {
  id: number;
  additionalInfo: ServerAchievementChannelAdditionalInfo
}

export class AchievementChannel extends BaseEntity {
    @key
      id: number;

    additionalInfo: AchievementChannelAdditionalInfo;

    constructor (client: WOLF, data: ServerAchievementChannel) {
      super(client);

      this.id = data.id;
      this.additionalInfo = new AchievementChannelAdditionalInfo(client, data.additionalInfo);
    }
}

export default AchievementChannel;

import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import AchievementUserAdditionalInfo, { ServerAchievementUserAdditionalInfo } from './achievementUserAdditionalInfo.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerAchievementUser {
  id: number;
  additionalInfo: ServerAchievementUserAdditionalInfo
}

export class AchievementUser extends BaseEntity {
  @key
    id: number;

  additionalInfo: AchievementUserAdditionalInfo;

  constructor (client: WOLF, data: ServerAchievementUser) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new AchievementUserAdditionalInfo(client, data.additionalInfo);
  }
}

export default AchievementUser;

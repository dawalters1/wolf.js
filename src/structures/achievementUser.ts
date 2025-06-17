import AchievementUserAdditionalInfo, { ServerAchievementUserAdditionalInfo } from './achievementUserAdditionalInfo.ts';
import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export type ServerAchievementUser = {
  id: number;
  additionalInfo: ServerAchievementUserAdditionalInfo
}

export class AchievementUser extends BaseEntity {
  @key
    id: number;

  additionalInfo: AchievementUserAdditionalInfo;
  childrenId?: Set<number>;

  constructor (client: WOLF, data: ServerAchievementUser) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new AchievementUserAdditionalInfo(client, data.additionalInfo);
  }

  patch (entity: ServerAchievementUser): this {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo.patch(entity.additionalInfo);

    return this;
  }
}

export default AchievementUser;

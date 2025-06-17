import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export type ServerAchievementUserAdditionalInfo = {
  awardedAt: Date | null;
  eTag: string;
  steps?: number;
  total?: number;
  categoryId: number
}

export class AchievementUserAdditionalInfo extends BaseEntity {
  awardedAt: Date | null;
  eTag: string;
  steps?: number;
  total?: number;
  categoryId: number;

  constructor (client: WOLF, data: ServerAchievementUserAdditionalInfo) {
    super(client);

    this.awardedAt = data?.awardedAt
      ? new Date(data.awardedAt)
      : null;
    this.eTag = data.eTag;
    this.steps = data.steps;
    this.total = data.total;
    this.categoryId = data.categoryId;
  }

  patch (entity: ServerAchievementUserAdditionalInfo): this {
    this.awardedAt = entity?.awardedAt
      ? new Date(entity.awardedAt)
      : null;
    this.eTag = entity.eTag;
    this.steps = entity.steps;
    this.total = entity.total;
    this.categoryId = entity.categoryId;

    return this;
  }
}

export default AchievementUserAdditionalInfo;

import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerAchievementChannelAdditionalInfo {
  awardedAt: Date | null;
  eTag: string;
  steps?: number;
  total?: number;
  categoryId: number
}

export class AchievementChannelAdditionalInfo extends BaseEntity {
  awardedAt: Date | null;
  eTag: string;
  steps?: number;
  total?: number;
  categoryId: number;
  childrenId?: Set<number>;

  constructor (client: WOLF, data: ServerAchievementChannelAdditionalInfo) {
    super(client);

    this.awardedAt = data?.awardedAt
      ? new Date(data.awardedAt)
      : null;
    this.eTag = data.eTag;
    this.steps = data.steps;
    this.total = data.total;
    this.categoryId = data.categoryId;

    this.childrenId = data.total
      ? new Set()
      : undefined;
  }

  patch (entity: any): this {
    return this;
  }
}

export default AchievementChannelAdditionalInfo;

import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerAchievementUserAdditionalInfo {
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

    this.awardedAt = data.awardedAt;
    this.eTag = data.eTag;
    this.steps = data.steps;
    this.total = data.total;
    this.categoryId = data.categoryId;
  }
}

export default AchievementUserAdditionalInfo;

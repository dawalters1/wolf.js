import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerAchievementChannelAdditionalInfo {
    awardedAt: Date | null;
    eTag: string;
    steps?: number;
    total?: number;
    categoryId: number
}

export class AchievementChannelAdditionalInfo extends Base {
  awardedAt: Date | null;
  eTag: string;
  steps?: number;
  total?: number;
  categoryId: number;
  childrenId?: Set<number>;

  constructor (client: WOLF, data: ServerAchievementChannelAdditionalInfo) {
    super(client);

    this.awardedAt = data.awardedAt;
    this.eTag = data.eTag;
    this.steps = data.steps;
    this.total = data.total;
    this.categoryId = data.categoryId;

    this.childrenId = data.total
      ? new Set()
      : undefined;
  }
}

export default AchievementChannelAdditionalInfo;

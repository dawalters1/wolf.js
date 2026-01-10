import BaseEntity from './BaseEntity.js';

export default class AchievementChannelAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.awardedAt = entity.awardedAt
      ? new Date(entity.awardedAt)
      : null;
    this.eTag = entity.eTag ?? null;
    this.steps = entity.steps ?? null;
    this.total = entity.total ?? null;
    this.categoryId = entity.categoryId ?? null;
  }
}

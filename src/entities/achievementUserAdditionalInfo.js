import BaseEntity from './baseEntity.js';

class AchievementUserAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.awardedAt = entity.awardedAt
      ? new Date(entity.awardedAt)
      : null;
    this.eTag = entity.eTag;
    this.steps = entity.steps;
    this.total = entity.total;
    this.categoryId = entity.categoryId;
  }

  /** @internal */
  patch (entity) {
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

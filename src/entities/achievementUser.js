import AchievementUserAdditionalInfo from './achievementUserAdditionalInfo.js';
import BaseEntity from './baseEntity.js';

export class AchievementUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new AchievementUserAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  patch (entity) {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo
      ? this.additionalInfo.patch(entity.additionalInfo)
      : new AchievementUserAdditionalInfo(this.client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? this.childrenId;

    return this;
  }
}

export default AchievementUser;

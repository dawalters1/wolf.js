import AchievementUserAdditionalInfo from './AchievementUserAdditionalInfo.js';
import BaseEntity from './BaseEntity.js';

export default class AchievementUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.userId = entity.userId;
    this.additionalInfo = new AchievementUserAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  async fetch (languageId) {
    return this.client.achievement.fetch(this.id, languageId);
  }
}

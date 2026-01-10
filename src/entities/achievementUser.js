import AchievementUserAdditionalInfo from './achievementUserAdditionalInfo.js';
import BaseEntity from './baseEntity.js';

export class AchievementUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new AchievementUserAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  async achievement (languageId) {
    return this.client.achievement.getById(this.id, languageId);
  }
}

export default AchievementUser;

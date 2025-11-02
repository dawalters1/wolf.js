import AchievementChannelAdditionalInfo from './achievementChannelAdditionalInfo.js';
import BaseEntity from './baseEntity.js';

export class AchievementChannel extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new AchievementChannelAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  async achievement (languageId) {
    return this.client.achievement.getById(this.id, languageId);
  }
}

export default AchievementChannel;

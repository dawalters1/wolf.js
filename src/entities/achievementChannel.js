import AchievementChannelAdditionalInfo from './achievementChannelAdditionalInfo.js';
import BaseEntity from './baseEntity.js';

export class AchievementChannel extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new AchievementChannelAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo
      ? this.additionalInfo.patch(entity.additionalInfo)
      : new AchievementChannelAdditionalInfo(this.client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? this.childrenId;
    return this;
  }

  async achievement (languageId) {
    return this.client.achievement.getById(this.id, languageId);
  }
}

export default AchievementChannel;

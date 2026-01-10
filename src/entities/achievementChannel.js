import AchievementChannelAdditionalInfo from './AchievementChannelAdditionalInfo.js';
import BaseEntity from './BaseEntity.js';

export default class AchievementChannel extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.channelId = entity.groupId;
    this.additionalInfo = new AchievementChannelAdditionalInfo(client, entity.additionalInfo);
    this.childrenId = entity.childrenId ?? null;
  }

  async fetch (languageId) {
    return this.client.achievement.fetch(this.id, languageId);
  }
}

import Base from './Base.js';

class AchievementUnlockableAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.awardedAt = data?.awardedAt;
    this.eTag = data?.eTag;
    this.steps = data?.steps ?? 0;
    this.total = data?.total ?? 0;
    this.categoryId = data?.categoryId;
  }
}

export default AchievementUnlockableAdditionalInfo;

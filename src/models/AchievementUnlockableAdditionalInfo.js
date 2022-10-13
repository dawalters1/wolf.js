import Base from './Base.js';

class AchievementUnlockableAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);
    this.awardedAt = data?.awardedAt;
    this.eTag = data?.eTag;
  }

  toJSON () {
    return {
      awardedAt: this.awardedAt,
      eTag: this.eTag
    };
  }
}

export default AchievementUnlockableAdditionalInfo;

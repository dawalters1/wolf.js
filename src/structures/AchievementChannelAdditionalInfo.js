import Base from './Base.js';

class AchievementChannelAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);

    this.awardedAt = data?.awardedAt;
    this.categoryId = data?.categoryId;
    this.eTag = data?.eTag;
    this.steps = data?.steps;
    this.total = data?.total;
  }
}

export default AchievementChannelAdditionalInfo;

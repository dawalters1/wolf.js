import AchievementChannelAdditionalInfo from './AchievementChannelAdditionalInfo.js';
import Base from './Base.js';

class AchievementChannel extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.additionalInfo = data?.additionalInfo
      ? new AchievementChannelAdditionalInfo(client, data.additionalInfo)
      : undefined;
  }
}

export default AchievementChannel;

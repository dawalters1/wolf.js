import AchievementUserAdditionalInfo from './AchievementUserAdditionalInfo.js';
import Base from './Base.js';

class AchievementUser extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.additionalInfo = data?.additionalInfo
      ? new AchievementUserAdditionalInfo(client, data.additionalInfo)
      : undefined;
  }
}

export default AchievementUser;

import AchievementUnlockableAdditionalInfo from './AchievementUnlockableAdditionalInfo.js';
import Base from './Base.js';

class AchievementUnlockable extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.additionalInfo = new AchievementUnlockableAdditionalInfo(client, data?.additionalInfo);
  }

  async achievement () {
    return await this.client.achievement.getById(this.id);
  }
}

export default AchievementUnlockable;

import AchievementUnlockableAdditionalInfo from './AchievementUnlockableAdditionalInfo.js';
import Base from './Base.js';

class AchievementUnlockable extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.additionalInfo = new AchievementUnlockableAdditionalInfo(client, data?.additionalInfo);
  }

  /**
   * Get the achievement
   * @returns {Promise<Achievement>}
   */
  async achievement () {
    return await this.client.achievement.getById(this.id);
  }

  toJSON () {
    return {
      id: this.id,
      additionalInfo: this.additionalInfo.toJSON()
    };
  }
}

export default AchievementUnlockable;

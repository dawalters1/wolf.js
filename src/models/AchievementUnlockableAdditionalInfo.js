const Base = require('./Base');

class AchievementUnlockableAdditionalInfo extends Base {
  constructor (client, data) {
    super(client);

    this.awardedAt = data.awardedAt;
    this.eTag = data.eTag;
  }
}

module.exports = AchievementUnlockableAdditionalInfo;

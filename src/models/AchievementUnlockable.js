const AchievementUnlockableAdditionalInfo = require('./AchievementUnlockableAdditionalInfo');
const Base = require('./Base');

class AchievementUnlockable extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new AchievementUnlockableAdditionalInfo(client, data.additionalInfo);
  }
}

module.exports = AchievementUnlockable;

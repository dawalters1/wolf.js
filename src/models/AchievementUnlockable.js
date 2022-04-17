const Base = require('./Base');

class AchievementUnlockable extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = AchievementUnlockable;

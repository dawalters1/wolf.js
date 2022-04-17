const Base = require('./Base');

class AchievementCategory extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }
}

module.exports = AchievementCategory;

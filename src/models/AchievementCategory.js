const Base = require('./Base');

class AchievementCategory extends Base {
  constructor (client, data) {
    super(client);
    this.type = data.type;
    this.name = data.name;
  }
}

module.exports = AchievementCategory;

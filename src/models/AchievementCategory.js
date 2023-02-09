import Base from './Base.js';

class AchievementCategory extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.name = data?.name;
  }
}

export default AchievementCategory;

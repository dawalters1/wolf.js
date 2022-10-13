import Base from './Base.js';

class AchievementCategory extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.name = data?.name;
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name
    };
  }
}

export default AchievementCategory;

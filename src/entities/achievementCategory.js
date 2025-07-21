import BaseEntity from './baseEntity.js';

export class AchievementCategory extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.name = entity.name;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.name = entity.name;

    return this;
  }


}

export default AchievementCategory;

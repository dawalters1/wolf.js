import BaseEntity from './baseEntity.js';

class Achievement extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.parentId = entity.parentId;
    this.typeId = entity.typeId;
    this.name = entity.name;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.category = entity.category;
    this.levelId = entity.levelId;
    this.levelName = entity.levelName;
    this.acquisitionPercentage = entity.acquisitionPercentage;
  }
}

export default Achievement;

import BaseEntity from './baseEntity.js';

class Achievement extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.parentId = entity.parentId ?? null;
    this.typeId = entity.typeId ?? null;
    this.name = entity.name ?? null;
    this.description = entity.description ?? null;
    this.imageUrl = entity.imageUrl ?? null;
    this.category = entity.category ?? null;
    this.levelId = entity.levelId ?? null;
    this.levelName = entity.levelName ?? null;
    this.acquisitionPercentage = entity.acquisitionPercentage ?? null;
  }
}

export default Achievement;

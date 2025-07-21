import BaseEntity from './baseEntity.js';

export class ChannelCategory extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.name = entity.name;
    this.pageName = entity.pageName;
    this.recipeId = entity.recipeId;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.name = entity.name;
    this.pageName = entity.pageName;
    this.recipeId = entity.recipeId;

    return this;
  }
}

export default ChannelCategory;

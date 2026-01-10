import BaseEntity from './BaseEntity.js';

export default class ChannelCategory extends BaseEntity {
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
}

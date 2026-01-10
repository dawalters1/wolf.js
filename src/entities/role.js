import BaseEntity from './baseEntity.js';

export class Role extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.description = entity.description;
    this.emojiUrl = entity.emojiUrl;
    this.name = entity.name;
    this.hexColur = entity.hexColur;
  }
}

export default Role;

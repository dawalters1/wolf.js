import BaseEntity from './baseEntity.js';

export class TopicRecipeAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.eTag = entity.eTag;
  }

  patch (entity) {
    this.eTag = entity.eTag;
    return this;
  }
}

export default TopicRecipeAdditionalInfo;

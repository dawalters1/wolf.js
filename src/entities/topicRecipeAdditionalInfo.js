import BaseEntity from './baseEntity.js';

export class TopicRecipeAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.hash = entity.hash;
  }
}

export default TopicRecipeAdditionalInfo;

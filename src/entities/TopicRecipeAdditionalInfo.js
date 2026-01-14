import BaseEntity from './BaseEntity.js';

export default class TopicRecipeAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.hash = entity.hash;
  }
}

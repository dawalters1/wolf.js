import BaseEntity from './BaseEntity.js';

export default class TopicRecipeAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.hash = entity.hash ?? undefined;
    this.weight = entity.weight ?? undefined;
    this.eTag = entity.eTag ?? undefined;
  }
}

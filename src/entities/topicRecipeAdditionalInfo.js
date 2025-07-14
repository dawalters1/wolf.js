import BaseEntity from './baseEntity.js';

export class TopicRecipeAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.hash = entity.hash;
  }

  /** @internal */
  patch (entity) {
    this.hash = entity.hash;
    return this;
  }
}

export default TopicRecipeAdditionalInfo;

import BaseEntity from './BaseEntity.js';

export default class AvatarUrl extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.small = entity.small;
    this.medium = entity.medium;
    this.large = entity.large;
  }
}

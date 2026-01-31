import BaseEntity from './BaseEntity.js';

export default class UserFrame extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.frameId = entity.frameId;
  }
}

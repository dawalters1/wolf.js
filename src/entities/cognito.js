import BaseEntity from './BaseEntity.js';

export default class Cognito extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.identity = entity.identity;
    this.token = entity.token;
  }
}

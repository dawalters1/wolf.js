import BaseEntity from './baseEntity.js';

class Cognito extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.identity = entity.identity;
    this.token = entity.token;
  }

  /** @internal */
  patch (entity) {
    this.identity = entity.identity;
    this.token = entity.token;

    return this;
  }
}

export default Cognito;

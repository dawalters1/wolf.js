import BaseEntity from './BaseEntity.js';
import EndpointConfig from './EndpointConfig.js';

export default class Welcome extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.ip = entity.ip;
    this.country = entity.country;
    this.loggedInUser = entity.loggedInUser;
    this.isLoggedIn = entity.loggedInUser !== null;
    this.token = entity.token;
    this.endpointConfig = new EndpointConfig(client, entity.endpointConfig);
  }
}

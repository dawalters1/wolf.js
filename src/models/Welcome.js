import { Base } from './Base.js';
import { Subscriber } from './Subscriber.js';
import { WelcomeEndpoint } from './WelcomeEndpoint.js';

class Welcome extends Base {
  constructor (client, data) {
    super(client);
    this.ip = data?.ip;
    this.token = data?.token;
    this.country = data?.country;
    this.endpointConfig = new WelcomeEndpoint(client, data?.endpointConfig);
    this.subscriber = data?.subscriber ? new Subscriber(client, data?.subscriber) : null;
  }
}

export { Welcome };

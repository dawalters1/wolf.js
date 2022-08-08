import { Base } from './Base.js';

class Presence extends Base {
  constructor (client, data) {
    super(client);
    this.device = data?.device;
    this.state = data?.state;
    this.lastActive = data?.lastActive;
    this.subscriberId = data?.subscriberId;
  }
}

export { Presence };

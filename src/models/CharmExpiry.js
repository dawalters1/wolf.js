import { Base } from './Base.js';

class CharmExpiry extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.charmId = data?.charmId;
    this.subscriberId = data?.subscriberId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.expireTime = data?.expireTime;
  }
}

export { CharmExpiry };

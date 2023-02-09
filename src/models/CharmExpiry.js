import Base from './Base.js';
import { CharmSelectedBuilder } from '../builders/index.js';

class CharmExpiry extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.charmId = data?.charmId;
    this.subscriberId = data?.subscriberId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.expireTime = data?.expireTime;
  }

  async charm () {
    return await this.client.charm.getById(this.charmId);
  }

  async set () {
    return await this.client.charm.set(new CharmSelectedBuilder(this.charmId, 0));
  }

  async delete () {
    return await this.client.charm.delete(this.id);
  }
}

export default CharmExpiry;

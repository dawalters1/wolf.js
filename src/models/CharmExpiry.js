import Base from './Base.js';

class CharmExpiry extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.charmId = data?.charmId;
    this.subscriberId = data?.subscriberId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.expireTime = data?.expireTime;
  }

  toJSON () {
    return {
      id: this.id,
      charmId: this.charmId,
      subscriberId: this.subscriberId,
      sourceSubscriberId: this.sourceSubscriberId,
      expireTime: this.expireTime
    };
  }
}

export default CharmExpiry;

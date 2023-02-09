import Base from './Base.js';

class CharmSummary extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.total = data?.total;
    this.expireTime = data?.expireTime;
    this.giftCount = data?.giftCount;
  }
}

export default CharmSummary;

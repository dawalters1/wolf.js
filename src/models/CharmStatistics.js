import Base from './Base.js';

class CharmStatistics extends Base {
  constructor (client, data) {
    super(client);
    this.subscriberId = data?.subscriberId;
    this.totalGiftedSent = data?.totalGiftedSent;
    this.totalGiftedReceived = data?.totalGiftedReceived;
    this.totalLifetime = data?.totalLifetime;
    this.totalActive = data?.totalActive;
    this.totalExpired = data?.totalExpired;
  }

  toJSON () {
    return {
      subscriberId: this.subscriberId,
      totalGiftedSent: this.totalGiftedSent,
      totalGiftedReceived: this.totalGiftedReceived,
      totalLifetime: this.totalLifetime,
      totalActive: this.totalActive,
      totalExpired: this.totalExpired
    };
  }
}

export default CharmStatistics;

import Base from './Base';
import CharmStatisticsExtended from './CharmStatisticExtended';

class CharmStatistic extends Base {
  constructor (client, data) {
    super(client);

    this.extended = data?.extended
      ? new CharmStatisticsExtended(client, data.extended)
      : undefined;
    this.userId = data?.subscriberId;
    this.totalActive = data?.totalActive;
    this.totalExpired = data?.totalExpired;
    this.totalGiftedReceived = data?.totalGiftedReceived;
    this.totalGiftedSent = data?.totalGiftedSent;
    this.totalLifetime = data?.totalLifetime;
  }
}

export default CharmStatistic;

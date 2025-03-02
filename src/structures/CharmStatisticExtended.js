import Base from './Base';

class CharmStatisticsExtended extends Base {
  constructor (client, data) {
    super(client);

    this.mostGiftedReceivedCharmId = data?.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = data?.mostGiftedSentCharmId;
  }
}

export default CharmStatisticsExtended;

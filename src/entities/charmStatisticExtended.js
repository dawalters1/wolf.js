
import BaseEntity from './baseEntity.js';

class CharmStatisticExtended extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.mostGiftedReceivedCharmId = entity.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = entity.mostGiftedSentCharmId;
  }

  /** @internal */
  patch (entity) {
    this.mostGiftedReceivedCharmId = entity.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = entity.mostGiftedSentCharmId;

    return this;
  }
}

export default CharmStatisticExtended;

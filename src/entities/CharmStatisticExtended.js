import BaseEntity from './BaseEntity.js';

export default class CharmStatisticExtended extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.mostGiftedReceivedCharmId = entity.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = entity.mostGiftedSentCharmId;
  }
}

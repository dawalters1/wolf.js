import BaseEntity from './BaseEntity.js';

export default class FrameStatisticExtended extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.mostGiftedSentFrameId = entity.mostGiftedReceivedCharmId;
    this.mostGiftedSentFrameId = entity.mostGiftedSentCharmId;
  }
}

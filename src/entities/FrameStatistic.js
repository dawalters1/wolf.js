import BaseEntity from './BaseEntity.js';
import FrameStatisticExtended from './FrameStatisticExtended.js';

export default class FrameStatistic extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.extended = entity.extended
      ? new FrameStatisticExtended(client, entity.extended)
      : null;
    this.totalActive = entity.totalActive ?? 0;
    this.totalExpired = entity.totalExpired ?? 0;
    this.totalGiftedReceived = entity.totalGiftedReceived ?? 0;
    this.totalGiftedSent = entity.totalGiftedSent ?? 0;
    this.totalLifetime = entity.totalLifetime ?? 0;
  }
}

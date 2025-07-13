import BaseEntity from './baseEntity.js';
import CharmStatisticExtended from './charmStatisticExtended.js';

export class CharmStatistic extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.extended = entity.extended
      ? new CharmStatisticExtended(client, entity.extended)
      : null;
    this.totalActive = entity.totalActive ?? 0;
    this.totalExpired = entity.totalExpired ?? 0;
    this.totalGiftedReceived = entity.totalGiftedReceived ?? 0;
    this.totalGiftedSent = entity.totalGiftedSent ?? 0;
    this.totalLifetime = entity.totalLifetime ?? 0;
  }

  /** @internal */
  patch (entity) {
    this.extended = entity.extended
      ? this.extended
        ? this.extended.patch(entity.extended)
        : new CharmStatisticExtended(this.client, entity.extended)
      : null;
    this.totalActive = entity?.totalActive ?? 0;
    this.totalExpired = entity?.totalExpired ?? 0;
    this.totalGiftedReceived = entity?.totalGiftedReceived ?? 0;
    this.totalGiftedSent = entity?.totalGiftedSent ?? 0;
    this.totalLifetime = entity?.totalLifetime ?? 0;

    return this;
  }
}

export default CharmStatistic;

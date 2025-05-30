import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';
import CharmStatisticExtended, { ServerCharmStatisticExtended } from './charmStatisticExtended.ts';

export interface ServerCharmStatistic {
  extended?: ServerCharmStatisticExtended;
  totalActive: number;
  totalExpired: number;
  totalGiftedReceived: number;
  totalGiftedSent: number;
  totalLifetime: number;
}

export class CharmStatistic extends BaseEntity {
  extended: CharmStatisticExtended | null;
  totalActive: number;
  totalExpired: number;
  totalGiftedReceived: number;
  totalGiftedSent: number;
  totalLifetime: number;
  /* @internal */
  fetched: boolean = false;

  constructor (client: WOLF, data?: ServerCharmStatistic) {
    super(client);

    this.extended = data?.extended
      ? new CharmStatisticExtended(client, data.extended)
      : null;
    this.totalActive = data?.totalActive ?? 0;
    this.totalExpired = data?.totalExpired ?? 0;
    this.totalGiftedReceived = data?.totalGiftedReceived ?? 0;
    this.totalGiftedSent = data?.totalGiftedSent ?? 0;
    this.totalLifetime = data?.totalLifetime ?? 0;

    this.fetched = !!data;
  }

  patch (charmStatistics: CharmStatistic) {
    this.totalActive = charmStatistics.totalActive;
    this.totalExpired = charmStatistics.totalExpired;
    this.totalGiftedReceived = charmStatistics.totalGiftedReceived;
    this.totalGiftedSent = charmStatistics.totalGiftedSent;
    this.totalLifetime = charmStatistics.totalLifetime;

    this.fetched = true;
    return this
  }
}

export default CharmStatistic;

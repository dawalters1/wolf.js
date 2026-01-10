import BaseEntity from './BaseEntity.js';
import IdHash from './IdHash.js';

export default class TipLeaderboardSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.totalSpend = entity?.totalSpend ?? undefined;
    this.topGifters = new Set(entity.topGifters?.map((topGifter) => new IdHash(this.client, topGifter)));
    this.topSpenders = new Set(entity.topSpenders?.map((topSpender) => new IdHash(this.client, topSpender)));

    if (entity.topChannels) {
      this.topChannels = new Set(entity.topGroups?.map((topChannel) => new IdHash(this.client, topChannel, true)));
    }

    if (entity.topCharms) {
      this.topCharms = new Set(entity.topCharms);
    }
  }
}

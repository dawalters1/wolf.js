import BaseEntity from './baseEntity.js';
import IdHash from './idHash.js';

export class TipLeaderboardSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.topGifters = new Set();
    this.topChannels = new Set();
    this.topSpenders = new Set();

    entity.topGifters?.forEach(topGifter => this.topGifters.add(new IdHash(this.client, topGifter)));
    entity.topGroups?.forEach(topChannel => this.topChannels.add(new IdHash(this.client, topChannel, true)));
    entity.topSpenders?.forEach(topSpender => this.topSpenders.add(new IdHash(this.client, topSpender)));
  }
}

export default TipLeaderboardSummary;

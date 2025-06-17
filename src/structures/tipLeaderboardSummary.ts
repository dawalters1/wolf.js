import BaseEntity from './baseEntity';
import IdHash, { ServerIdHash } from './idHash';
import WOLF from '../client/WOLF';

export type ServerTipLeaderboardSummary = {
    topGifters?: ServerIdHash[]
    topGroups?: ServerIdHash[]
    topSpenders?: ServerIdHash[]
}

export class TipLeaderboardSummary extends BaseEntity {
  topGifters: Set<IdHash> = new Set();
  topChannels: Set<IdHash> = new Set();
  topSpenders: Set<IdHash> = new Set();

  constructor (client: WOLF, data: ServerTipLeaderboardSummary) {
    super(client);

    data.topGifters?.map((topGifter) => this.topGifters.add(new IdHash(this.client, topGifter)));
    data.topGroups?.map((topChannel) => this.topGifters.add(new IdHash(this.client, topChannel, true)));
    data.topSpenders?.map((topSpender) => this.topGifters.add(new IdHash(this.client, topSpender)));
  }
}

export default TipLeaderboardSummary;

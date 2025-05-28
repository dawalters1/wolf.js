import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerCharmStatisticExtended {
    mostGiftedReceivedCharmId: number;
    mostGiftedSentCharmId: number;
}

export class CharmStatisticExtended extends Base {
  mostGiftedReceivedCharmId: number;
  mostGiftedSentCharmId: number;

  constructor (client: WOLF, data: ServerCharmStatisticExtended) {
    super(client);

    this.mostGiftedReceivedCharmId = data.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = data.mostGiftedSentCharmId;
  }
}

export default CharmStatisticExtended;

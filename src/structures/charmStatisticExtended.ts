import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerCharmStatisticExtended {
  mostGiftedReceivedCharmId: number;
  mostGiftedSentCharmId: number;
}

export class CharmStatisticExtended extends BaseEntity {
  mostGiftedReceivedCharmId: number;
  mostGiftedSentCharmId: number;

  constructor (client: WOLF, data: ServerCharmStatisticExtended) {
    super(client);

    this.mostGiftedReceivedCharmId = data.mostGiftedReceivedCharmId;
    this.mostGiftedSentCharmId = data.mostGiftedSentCharmId;
  }
}
export default CharmStatisticExtended;

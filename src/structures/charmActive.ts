import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerCharmActive = {
    id: number;
    charmId: number;
    subscriberId: number | null;
    sourceSubscriberId: number | null;
    expireTime: Date | null;
}

export class CharmActive extends BaseEntity {
  id: number;
  charmId: number;
  userId: number | null;
  sourceUserId: number | null;
  expireTime: Date | null;

  constructor (client: WOLF, data: ServerCharmActive) {
    super(client);

    this.id = data.id;
    this.charmId = data.charmId;
    this.userId = data.subscriberId;
    this.sourceUserId = data.sourceSubscriberId;
    this.expireTime = data.expireTime
      ? new Date(data.expireTime)
      : null;
  }
}

export default CharmActive;

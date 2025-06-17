import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';
import { WOLFStarTalent } from '../constants';

export type ServerWOLFStar = {
    subscriberId: number;
    shows: number;
    maxListeners: number;
    totalListeners: number;
    talentList: WOLFStarTalent[]
}

export class WOLFStar extends BaseEntity {
  @key
    userId: number;

  shows: number;
  maxListeners: number;
  totalListeners: number;
  talentList: WOLFStarTalent[];

  constructor (client: WOLF, data: ServerWOLFStar) {
    super(client);

    this.userId = data.subscriberId;
    this.shows = data.shows;
    this.maxListeners = data.maxListeners;
    this.totalListeners = data.totalListeners;
    this.talentList = data.talentList;
  }

  patch (entity: ServerWOLFStar): this {
    this.userId = entity.subscriberId;
    this.shows = entity.shows;
    this.maxListeners = entity.maxListeners;
    this.totalListeners = entity.totalListeners;
    this.talentList = entity.talentList;

    return this;
  }
}

export default WOLFStar;

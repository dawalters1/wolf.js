import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';
import { WOLFStarTalent } from '../constants';

export interface ServerWOLFStar {
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
}

export default WOLFStar;

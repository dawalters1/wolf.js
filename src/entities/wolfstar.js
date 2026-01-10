import BaseEntity from './baseEntity.js';

export class WOLFStar extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.shows = entity.shows;
    this.maxListeners = entity.maxListeners;
    this.totalListeners = entity.totalListeners;
    this.talentList = entity.talentList;
  }
}

export default WOLFStar;

import BaseEntity from './BaseEntity.js';

export default class WOLFStar extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.shows = entity.shows;
    this.maxListeners = entity.maxListeners;
    this.totalListeners = entity.totalListeners;
    this.talentList = entity.talentList;
  }
}

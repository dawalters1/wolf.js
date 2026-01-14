import BaseEntity from './BaseEntity.js';

export default class UserFollower extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.followerId = entity.followerId;
    this.hash = entity.hash;
  }
}

import BaseEntity from './baseEntity.js';

export class UserFollower extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.followerId = entity.followerId;
    this.hash = entity.hash;
  }

  /** @internal */
  patch (entity) {
    this.followerId = entity.followerId;
    this.hash = entity.hash;
  }
}

export default UserFollower;

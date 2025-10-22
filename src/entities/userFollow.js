import BaseEntity from './baseEntity.js';

export class UserFollow extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.notification = entity.notification;
    this.hash = entity.hash;
  }

  async unfollow () {
    return await this.client.user.followers.unfollow(this.userId);
  }

  async toggleNotification () {
    return await this.client.user.followers.update(this.userId, !this.notification);
  }
}

export default UserFollow;

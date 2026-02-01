import BaseEntity from './BaseEntity.js';

export default class UserFollow extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId ?? entity.id;
    this.notification = entity.notification ?? entity.additionalInfo.notification ?? true;
    this.hash = entity.hash ?? entity.additionalInfo.hash;
  }

  async user () {
    return this.client.user.fetch(this.userId);
  }

  async unfollow () {
    return await this.client.user.followers.unfollow(this.userId);
  }

  async update (config) {
    return await this.client.user.followers.update(this.userId, config);
  }
}

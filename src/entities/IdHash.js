import AvatarUrl from './AvatarUrl.js';
import BaseEntity from './BaseEntity.js';

export default class IdHash extends BaseEntity {
  constructor (client, entity, isChannel = false) {
    super(client);
    this.id = entity.id ?? entity.subscriberId;
    this.hash = entity.hash;
    this.name = entity.name ?? null;
    this.avatarUrl = entity.avatarUrl
      ? new AvatarUrl(client, entity.avatarUrl)
      : null;
    this.isChannel = isChannel;
  }

  async fetch () {
    return this.client[this.isChannel
      ? 'channel'
      : 'user'].fetch(this.id);
  }
}

import BaseEntity from './BaseEntity.js';

export default class ChannelAudioSlotRequest extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.reservedUserId = entity.subscriberId ?? entity.reservedOccupierId;
    this.channelId = entity.groupId;
    this.reservedExpiresAt = new Date(entity.expiresAt ?? entity.reservedExpiresAt);
  }
}

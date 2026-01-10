import BaseEntity from './baseEntity.js';

export class ChannelAudioSlotRequest extends BaseEntity {
  constructor (client, entity) {
    super(client);

    if ('reservedOccupierId' in entity) {
      this.reservedUserId = entity.reservedOccupierId;
      this.channelId = entity.groupId;
      this.reservedExpiresAt = new Date(entity.reservedExpiresAt);
    } else {
      this.reservedUserId = entity.subscriberId;
      this.channelId = entity.groupId;
      this.reservedExpiresAt = new Date(entity.expiresAt);
    }
  }
}

export default ChannelAudioSlotRequest;

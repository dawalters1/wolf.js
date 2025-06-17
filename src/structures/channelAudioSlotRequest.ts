import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key';
import { ServerGroupAudioRequestAddEvent } from '../client/websocket/events/GROUP_AUDIO_REQUEST_ADD';
import WOLF from '../client/WOLF';

export type ServerGroupAudioSlotRequest = {
    groupId: number;
    reservedOccupierId: number;
    reservedExpiresAt: Date;
}

export class ChannelAudioSlotRequest extends BaseEntity {
  @key
    reservedUserId: number;

  channelId: number;
  reservedExpiresAt: Date;

  constructor (client: WOLF, data: ServerGroupAudioSlotRequest | ServerGroupAudioRequestAddEvent) {
    super(client);

    if ('reservedOccupierId' in data) {
      this.reservedUserId = data.reservedOccupierId;
      this.channelId = data.groupId;
      this.reservedExpiresAt = new Date(data.reservedExpiresAt);
    } else {
      this.reservedUserId = data.subscriberId;
      this.channelId = data.groupId;
      this.reservedExpiresAt = new Date(data.expiresAt);
    }
  }

  patch (entity: ServerGroupAudioSlotRequest) {
    if ('reservedOccupierId' in entity) {
      this.reservedUserId = entity.reservedOccupierId;
      this.channelId = entity.groupId;
      this.reservedExpiresAt = new Date(entity.reservedExpiresAt);
    }

    return this;
  }
}

export default ChannelAudioSlotRequest;

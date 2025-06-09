import BaseEntity from './baseEntity.ts';
import { ServerGroupAudioSlot } from './channelAudioSlot.ts';
import { ServerGroupAudioSlotRequest } from './channelAudioSlotRequest';
import WOLF from '../client/WOLF.ts';

export class ChannelAudioSlotReservation extends BaseEntity {
  userId: number;
  expiresAt: Date;

  constructor (client: WOLF, data: Partial<ServerGroupAudioSlot | ServerGroupAudioSlotRequest>) {
    super(client);

    this.userId = data.reservedOccupierId as number;
    this.expiresAt = new Date(data.reservedExpiresAt as Date);
  }

  patch (entity: ServerGroupAudioSlot | ServerGroupAudioSlotRequest): this {
    this.userId = entity.reservedOccupierId as number;
    this.expiresAt = new Date(entity.reservedExpiresAt as Date);

    return this;
  }
}

export default ChannelAudioSlotReservation;

import BaseEntity from './baseEntity.ts';
import { ServerChannelAudioSlot } from './channelAudioSlot.ts';
import { ServerChannelAudioSlotRequest } from './channelAudioSlotRequest';
import WOLF from '../client/WOLF.ts';

export class ChannelAudioSlotReservation extends BaseEntity {
  userId: number;
  expiresAt: Date;

  constructor (client: WOLF, data: Partial<ServerChannelAudioSlot | ServerChannelAudioSlotRequest>) {
    super(client);

    this.userId = data.reservedOccupierId as number;
    this.expiresAt = new Date(data.reservedExpiresAt as Date);
  }

  patch (entity: any): this {
    return this;
  }
}

export default ChannelAudioSlotReservation;

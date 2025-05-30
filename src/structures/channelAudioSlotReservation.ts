import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import { ServerChannelAudioSlot } from './channelAudioSlot.ts';

export class ChannelAudioSlotReservation extends Base {
  userId: number;
  expiresAt: Date;

  constructor (client: WOLF, data: Partial<ServerChannelAudioSlot>) {
    super(client);

    this.userId = data.reservedOccupierId as number;
    this.expiresAt = data.reservedExpiresAt as Date;
  }
}

export default ChannelAudioSlotReservation;

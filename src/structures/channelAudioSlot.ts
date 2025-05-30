import WOLF from '../client/WOLF.ts';
import { ChannelAudioSlotConnectionState } from '../constants/ChannelAudioConnectionState.ts';
import { key } from '../decorators/key.ts';
import ChannelAudioSlotReservation from './channelAudioSlotReservation.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerChannelAudioSlot {
  id: number;
  locked: boolean;
  occupierId: number | null;
  occupierMuted: boolean;
  reservedExpiresAt: Date | null;
  reservedOccupierId: number | null;
  connectionState: ChannelAudioSlotConnectionState;
  uuid: string;
}

export class ChannelAudioSlot extends BaseEntity {
    @key
      id: number;

    isLocked: boolean;
    isMuted: boolean;
    isOccupied: boolean;
    userId: number | null;
    isReserved: boolean;
    reservation?: ChannelAudioSlotReservation;
    connectionState: ChannelAudioSlotConnectionState;
    uuid: string;

    constructor (client: WOLF, data: ServerChannelAudioSlot) {
      super(client);

      this.id = data.id;
      this.isLocked = data.locked;
      this.isMuted = data.occupierMuted;
      this.userId = data.occupierId;
      this.isReserved = data.reservedOccupierId !== undefined;
      this.reservation = data.reservedOccupierId
        ? new ChannelAudioSlotReservation(client, data)
        : undefined;
      this.connectionState = data.connectionState;
      this.uuid = data.uuid;
      this.isOccupied = data.occupierId !== null || this.reservation !== undefined;
    }
}

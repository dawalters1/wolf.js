import BaseEntity from './baseEntity.ts';
import { ChannelAudioSlotConnectionState } from '../constants/ChannelAudioConnectionState.ts';
import ChannelAudioSlotReservation from './channelAudioSlotReservation.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

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

  patch (entity: ServerChannelAudioSlot): this {
    this.id = entity.id;
    this.isLocked = entity.locked;
    this.isMuted = entity.occupierMuted;
    this.userId = entity.occupierId;
    this.isReserved = entity.reservedOccupierId !== undefined;
    this.reservation = this.reservation
      ? entity.reservedOccupierId
        ? this.reservation.patch(entity)
        : undefined
      : entity.reservedOccupierId
        ? new ChannelAudioSlotReservation(this.client, entity)
        : undefined;

    this.connectionState = entity.connectionState;
    this.uuid = entity.uuid;
    this.isOccupied = entity.occupierId !== null || this.reservation !== undefined;

    return this;
  }
}

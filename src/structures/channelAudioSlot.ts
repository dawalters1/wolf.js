import BaseEntity from './baseEntity.ts';
import { ChannelAudioSlotConnectionState } from '../constants/ChannelAudioConnectionState.ts';
import ChannelAudioSlotReservation from './channelAudioSlotReservation.ts';
import { key } from '../decorators/key.ts';
import { ServerGroupAudioSlotUpdate } from '../client/websocket/events/GROUP_AUDIO_SLOT_UPDATE';
import WOLF from '../client/WOLF.ts';

export type ServerGroupAudioSlot = {
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
  connectionState: ChannelAudioSlotConnectionState | null;
  uuid: string;

  constructor (client: WOLF, data: ServerGroupAudioSlot) {
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

  patch (entity: ServerGroupAudioSlot | ServerGroupAudioSlotUpdate): this {
    const data = 'slot' in entity ? entity.slot : entity;

    this.id = data.id;
    this.isLocked = data.locked;
    this.isMuted = data.occupierMuted;
    this.userId = data.occupierId;
    this.isReserved = data.reservedOccupierId !== undefined;
    this.reservation = this.reservation
      ? data.reservedOccupierId
        ? this.reservation.patch(data)
        : undefined
      : data.reservedOccupierId
        ? new ChannelAudioSlotReservation(this.client, entity)
        : undefined;

    this.connectionState = data.connectionState;
    this.uuid = data.uuid;
    this.isOccupied = data.occupierId !== null || this.reservation !== undefined;

    return this;
  }
}

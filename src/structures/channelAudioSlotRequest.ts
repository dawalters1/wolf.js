import BaseEntity from './baseEntity.ts';
import ChannelAudioSlotReservation from './channelAudioSlotReservation';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';

export interface ServerChannelAudioSlotRequest {
    slotId: number;
    groupId: number;
    reservedOccupierId: number;
    reservedExpiresAt: Date;
}

export class ChannelAudioSlotRequest extends BaseEntity {
  @key
    slotId: number;

  channelId: number;
  reservation: ChannelAudioSlotReservation;

  constructor (client: WOLF, data: ServerChannelAudioSlotRequest) {
    super(client);
    this.slotId = data.slotId;
    this.channelId = data.groupId;
    this.reservation = new ChannelAudioSlotReservation(client, data);
  }

  patch (entity: any): this {
    return this;
  }
}

export default ChannelAudioSlotRequest;

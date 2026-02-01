import BaseEntity from './BaseEntity.js';
import ChannelAudioSlotReservation from './ChannelAudioSlotReservation.js';

export default class ChannelAudioSlot extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.channelId = entity.groupId;
    this.isLocked = entity.locked;
    this.isMuted = entity.occupierMuted;
    this.userId = entity.occupierId;
    this.isReserved = entity.reservedOccupierId !== undefined;
    this.reservation = entity.reservedOccupierId
      ? new ChannelAudioSlotReservation(client, entity)
      : undefined;
    this.connectionState = entity.connectionState;
    this.uuid = entity.uuid;
    this.isOccupied = entity.occupierId !== null || this.reservation !== undefined;
  }

  async join () {
    return this.client.audio.slots.join(this.channelId, this.id);
  }

  async leave () {
    return this.client.audio.slots.leave(this.channelId, this.id);
  }

  async kick () {
    return this.client.audio.slots.kick(this.channelId, this.id);
  }

  async mute () {
    return this.client.audio.slots.mute(this.channelId, this.id);
  }

  async unmute () {
    return this.client.audio.slots.unmute(this.channelId, this.id);
  }
}

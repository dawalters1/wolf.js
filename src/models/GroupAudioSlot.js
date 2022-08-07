import Base from './Base.js';
class GroupAudioSlot extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.locked = data?.locked;
    this.occupierId = data?.occupierId;
    this.occupierMuted = data?.occupierMuted;
    this.uuid = data?.uuid;
    this.connectionState = data?.connectionState;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }
}
export default GroupAudioSlot;

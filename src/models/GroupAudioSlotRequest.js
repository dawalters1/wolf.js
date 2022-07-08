const Base = require('./Base');

class GroupAudioSlotRequest extends Base {
  constructor (client, data) {
    super(client);

    this.slotId = data.slotId;
    this.groupId = data.groupId;
    this.reservedOccupierId = data.reservedOccupierId;
    this.reservedExpiresAt = data.reservedExpiresAt;
  }
  // TODO: Methods
}

module.exports = GroupAudioSlotRequest;

const Base = require('./Base');
const GroupAudioSlot = require('./GroupAudioSlot');

class GroupAudioSlotUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.slot = new GroupAudioSlot(client, data.slot);
  }
}

module.exports = GroupAudioSlotUpdate;

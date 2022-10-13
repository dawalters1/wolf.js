import Base from './Base.js';
import GroupAudioSlot from './GroupAudioSlot.js';

class GroupAudioSlotUpdate extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.slot = new GroupAudioSlot(client, data?.slot);
  }

  toJSON () {
    return {
      id: this.id,
      slot: this.slot.toJSON()
    };
  }
}

export default GroupAudioSlotUpdate;

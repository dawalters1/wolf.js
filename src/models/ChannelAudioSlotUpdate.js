import Base from './Base.js';
import ChannelAudioSlot from './ChannelAudioSlot.js';

class ChannelAudioSlotUpdate extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.slot = new ChannelAudioSlot(client, data?.slot);
    this.sourceSubscriberId = data?.sourceSubscriberId;
  }
}

export default ChannelAudioSlotUpdate;

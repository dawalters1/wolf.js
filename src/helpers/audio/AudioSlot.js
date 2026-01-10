import BaseHelper from '../BaseHelper.js';

export default class AudioSlotHelper extends BaseHelper {
  async fetch (channelId, slotId, opts) {
    if (slotId instanceof Object) {
      opts = slotId;
      slotId = null;
    }

    if (!slotId) {
      // TODO:
    }

    const normalisedSlotId = this.normaliseNumber(channelId);

    const slots = await this.fetch(channelId, opts);

    if (!slotId) {}
  }

  async lock (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);
  }

  async unlock (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);
  }
}

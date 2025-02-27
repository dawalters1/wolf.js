import Base from './Base.js';

class StageSlotCache extends Base {
  get (channelId, slotIds = null) {
    const cache = this.cache.get(channelId) ?? null;

    if (slotIds === null) { return cache?.values() ?? null; }

    const result = (Array.isArray(slotIds) ? slotIds : [slotIds]).map((slotId) => this.cache?.get(slotId) ?? null);

    return Array.isArray(slotIds) ? result : result[0];
  }

  set (channelId, slots) {
    const cache = this.cache.get(channelId) ?? this.cache.set(channelId, new Map()).get(channelId);

    const result = (Array.isArray(slots) ? slots : [slots])
      .reduce((results, slot) => {
        const existing = cache.get(slot.id);

        results.push(
          cache.set(
            slot.id,
            existing?._patch(slot) ?? slot
          ).get(slot.id));

        return results;
      }, []);

    return Array.isArray(slots) ? result : result[0];
  }

  delete (channelId) {
    return this.cache.delete(channelId);
  }
}

export default StageSlotCache;

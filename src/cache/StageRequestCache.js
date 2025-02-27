import Base from './Base.js';

class StageRequestCache extends Base {
  get (channelId) {
    return this.cache.get(channelId)?.values() ?? [];
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

export default StageRequestCache;

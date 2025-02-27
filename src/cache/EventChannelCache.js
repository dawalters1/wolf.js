import Base from './Base.js';

class EventChannelCache extends Base {
  get (channelId, eventIds = null) {
    const cache = this.cache.get(channelId) ?? null;

    if (eventIds === null) { return cache?.values() ?? null; }

    const result = (Array.isArray(eventIds) ? eventIds : [eventIds]).map((eventId) => cache?.get(eventId) ?? null);

    return Array.isArray(eventIds) ? result : result[0];
  }

  set (channelId, events) {
    const cache = this.cache.get(channelId) ?? this.cache.set(channelId, new Map()).get(channelId);

    const result = (Array.isArray(events) ? events : [events])
      .reduce((results, event) => {
        const existing = this.cache.get(event.id);

        results.push(
          cache.set(
            event.id,
            existing?._patch(event) ?? event

          ).get(event.id)
        );

        return results;
      }, []);

    return Array.isArray(events) ? result : result[0];
  }

  delete (eventId) {
    return this.cache.delete(eventId);
  }
}

export default EventChannelCache;

import Base from './Base.js';

class EventCache extends Base {
  list () {
    return this.cache.values();
  }

  get (eventId) {
    return this.cache.get(eventId) ?? null;
  }

  set (events) {
    const result = (Array.isArray(events) ? events : [events])
      .reduce((results, event) => {
        const existing = this.cache.get(event.id);

        results.push(
          this.cache.set(
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

export default EventCache;

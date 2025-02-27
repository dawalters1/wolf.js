import Base from './Base.js';

class BlockedCache extends Base {
  constructor () {
    super();

    this.fetched = false;
  }

  list () {
    return this.cache.values();
  }

  get (userId) {
    return this.cache.get(userId) ?? null;
  }

  set (blocked) {
    const result = (Array.isArray(blocked) ? blocked : [blocked])
      .reduce((results, blocked) => {
        const existing = this.cache.get(blocked.id);

        results.push(
          this.cache.set(
            blocked.id,
            existing?._patch(blocked) ?? blocked

          ).get(blocked.id)
        );

        return results;
      }, []);

    return Array.isArray(blocked) ? result : result[0];
  }

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default BlockedCache;

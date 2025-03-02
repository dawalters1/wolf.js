import ExpiryMap from 'expiry-map';
import Base from './Base.js';

class CharmExpiryCache extends Base {
  get (userId) {
    return this.cache.get(userId) ?? null;
  }

  set (userId, expiries) {
    const cache = this.cache.get(userId) ?? this.cache.set(userId, new ExpiryMap(60)).get(userId);

    const result = (Array.isArray(expiries) ? expiries : [expiries])
      .reduce((results, expiry) => {
        const existing = this.cache.get(expiry.id);

        results.push(
          cache.set(
            expiry.id,
            existing?._patch(expiry) ?? expiry

          ).get(expiry.id)
        );

        return results;
      }, []);

    return Array.isArray(expiries) ? result : result[0];
  }

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default CharmExpiryCache;

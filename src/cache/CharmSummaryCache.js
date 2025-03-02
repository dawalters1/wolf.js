import ExpiryMap from 'expiry-map';
import Base from './Base.js';

class CharmSummaryCache extends Base {
  get (userId, charmIds = null) {
    const cache = this.cache.get(userId) ?? null;

    if (charmIds === null) { return cache?.values() ?? null; }

    const result = (Array.isArray(charmIds) ? charmIds : [charmIds]).map((charmId) => cache?.get(charmId) ?? null);

    return Array.isArray(charmIds) ? result : result[0];
  }

  set (userId, statistics) {
    const cache = this.cache.get(userId) ?? this.cache.set(userId, new ExpiryMap(60)).get(userId);

    const result = (Array.isArray(statistics) ? statistics : [statistics])
      .reduce((results, statistic) => {
        const existing = cache.get(statistic.charmId);

        results.push(
          cache.set(
            statistic.charmId,
            existing?._patch(statistic) ?? statistic
          )
            .get(statistic.charmId)
        );

        return results;
      }, []);

    return Array.isArray(statistics) ? result : result[0];
  }

  delete (userId, charmId = null) {
    if (charmId === null) {
      return this.cache.delete(userId);
    }

    return this.cache.get(userId)?.delete(charmId);
  }
}

export default CharmSummaryCache;

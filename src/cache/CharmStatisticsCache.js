import Base from './Base.js';

class CharmStatisticsCache extends Base {
  constructor () {
    super(30);
  }

  get (userId) {
    return this.cache.get(userId) ?? null;
  }

  set (statistics) {
    const existing = this.cache.get(statistics.userId);

    return this.cache.set(
      statistics.userId,
      existing?._patch(statistics) ?? statistics
    ).get(statistics.userId);
  }

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default CharmStatisticsCache;

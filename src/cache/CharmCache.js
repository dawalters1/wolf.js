import Base from './Base.js';

class CharmCache extends Base {
  list () {
    return this.cache.values();
  }

  get (charmId) {
    return this.cache.get(charmId) ?? null;
  }

  set (charms) {
    const result = (Array.isArray(charms) ? charms : [charms])
      .reduce((results, charm) => {
        const existing = this.cache.get(charm.id);

        results.push(
          this.cache.set(
            charm.id,
            existing?._patch(charm) ?? charm

          ).get(charm.id)
        );

        return results;
      }, []);

    return Array.isArray(charms) ? result : result[0];
  }

  delete (charmId) {
    return this.cache.delete(charmId);
  }
}

export default CharmCache;

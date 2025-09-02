const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

class BaseManager {
  constructor (store = Map) {
    // eslint-disable-next-line new-cap
    this.store = new store();
    this.fetched = false;

    if (store === Map) {
      setInterval(() => {
        const expired = Array.from(this.store.entries())
          .filter(([, value]) => value.expiresAt && value.expiresAt <= Date.now());

        expired.forEach(([key]) => this.store.delete(key));

        if (expired.length && this.store.size === 0) {
          this.fetched = false;
        }
      }, 120);
    }
  }

  set (value, maxAge = null) {
    const id = this.resolveId(value);

    if (this.store instanceof Map) {
      return this.store.set(
        id,
        {
          value,
          expiresAt: maxAge
            ? Date.now() + (maxAge * 1000)
            : null
        }
      ).get(id)?.value ?? null;
    }

    return this.store.add(id);
  }

  get (...args) {
    return this.store.get(args)?.value ?? null;
  }

  has (...args) {
    return this.store.has(args);
  }

  delete (...args) {
    return this.store.delete(...args);
  }

  clear () {
    this.store.clear();
    this.fetched = false;
  }

  get size () {
    return this.store.size;
  }

  values () {
    return [...this.store.values()].map((value) => value.value);
  }

  keys () {
    return [...this.store.keys()];
  }
}

export default BaseManager;

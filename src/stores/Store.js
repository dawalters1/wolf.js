const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

class Store {
  constructor (store = Map) {
    // eslint-disable-next-line new-cap
    this.store = new store();

    if (store === Map) {
      setInterval(() => {
        const sizePrior = this.store.size;

        const cleanMap = (map) => {
          for (const [id, value] of map) {
            if (value instanceof Map) {
              cleanMap(value);

              if (value.size === 0) { map.delete(id); }
            } else if (value && typeof value === 'object') {
              const { expiresAt } = value;
              if (expiresAt && expiresAt <= Date.now()) { map.delete(id); }
            }
          }
        };

        cleanMap(this.store);

        if (sizePrior > 0 && this.store.size === 0) { this.fetched = false; }
      }, 120);
    }
  }

  /**
   *
   * @param {string|number|Array<string|number>} key
   * @returns {any}
   */
  get (key) {
    if (key instanceof Array) {
      return key.map((key) => this.get(key));
    }

    const value = this.store.get(key) ?? null; ;

    if (this.store instanceof Set) { return value; }

    if (!value || value?.expiresAt < Date.now()) { return null; }

    return value.value;
  }

  add (value) {
    if (!(this.store instanceof Set)) { throw Error; }

    if (value instanceof Array) {
      return value.map((value) => this.add(value));
    }

    return this.store.add(value);
  }

  delete (key) {
    if (key instanceof Array) {
      return key.map((key) => this.delete(key));
    }

    const deleted = this.store.delete(key);
    this.fetched = deleted && this.store.size === 0;

    return deleted;
  }

  set (value, maxAge = null) {
    if (value instanceof Array) {
      return value.map((value) => this.set(value, maxAge));
    }
    const key = getKeyProperty(value);

    const existing = this.get(key);

    const storeValue = {
      value: existing?.patch(value) ?? value,
      expiresAt: maxAge
        ? Date.now() + maxAge
        : null
    };

    return this.store.set(key, storeValue).get(key);
  }

  values () {
    return [...this.values()];
  }

  clear () {
    this.fetched = false;
    return this.store.clear();
  }

  invalidate () {
    throw new Error('Not implemented');
  }
}

export default Store;

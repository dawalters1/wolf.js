class Collection {
  constructor (initialState = [], { type = 'map' } = {}) {
    this.type = type;
    this.store = type === 'set'
      ? new Set(initialState)
      : new Map(initialState);
  }

  get size () {
    return this.store.size;
  }

  clear () {
    this.store.clear();
  }

  set (key, value) {
    if (this.type === 'set') {
      throw new Error('Cannot call set() on a Set Collection. Use add().');
    }

    return this.store.set(key, value);
  }

  get (key) {
    return this.type === 'set'
      ? (this.store.has(key)
          ? key
          : null)
      : this.store.get(key);
  }

  has (key) {
    return this.store.has(key);
  }

  delete (key) {
    return this.store.delete(key);
  }

  keys () {
    return this.type === 'set'
      ? this.store.values()
      : this.store.keys();
  }

  values () {
    return this.type === 'set'
      ? this.store.values()
      : this.store.values();
  }

  entries () {
    return this.type === 'set'
      ? Array.from(this.store.values(), v => [v, v])
      : this.store.entries();
  }

  forEach (fn) {
    if (this.type === 'set') {
      this.store.forEach(v => fn(v, v, this));
    } else {
      this.store.forEach((v, k) => fn(v, k, this));
    }
  }

  // ---- Set-like methods ----
  add (value) {
    if (this.type !== 'set') {
      throw new Error('Cannot call add() on a Map Collection. Use set().');
    }
    return this.store.add(value);
  }

  first () {
    return this.values().next().value;
  }

  last () {
    return [...this.values()].slice(-1)[0];
  }

  at (index) {
    return [...this.values()][index];
  }

  find (fn) {
    if (this.type === 'set') {
      return [...this.values()].find(v => fn(v, v, this));
    }
    return [...this.entries()].find(([k, v]) => fn(v, k, this))?.[1];
  }

  filter (fn) {
    if (this.type === 'set') {
      return new Collection(
        [...this.values()].filter(v => fn(v, v, this)),
        { type: 'set' }
      );
    }
    return new Collection(
      [...this.entries()].filter(([k, v]) => fn(v, k, this)),
      { type: 'map' }
    );
  }

  some (fn) {
    if (this.type === 'set') {
      return [...this.values()].some(v => fn(v, v, this));
    }
    return [...this.entries()].some(([k, v]) => fn(v, k, this));
  }

  sweep (fn) {
    let removed = 0;
    if (this.type === 'set') {
      for (const v of this.store) {
        if (fn(v, v, this)) {
          this.store.delete(v);
          removed++;
        }
      }
    } else {
      for (const [k, v] of this.store) {
        if (fn(v, k, this)) {
          this.store.delete(k);
          removed++;
        }
      }
    }
    return removed;
  }
}

export default Collection;

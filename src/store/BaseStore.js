import Collection from './Collection.js';

class BaseStore {
  constructor (options = {}) {
    this.stores = options?.type;
    this.collection = new Collection([], { type: this.stores });
    this.maxSize = options?.maxSize > 0
      ? options.maxSize
      : Infinity;

    if (this.stores === 'map' && options?.sweepInterval) {
      this._sweepHandle = setInterval(() => this.sweepExpired(), options.sweepInterval);
    }
  }

  #touch (entry) {
    if (this.stores === 'map') {
      entry.lastUsed = Date.now();
    }
  }

  _ensureSizeLimit () {
    if (this.stores !== 'map') { return; }

    while (this.size > this.maxSize) {
      let oldestKey = null;
      let oldestTime = Infinity;

      for (const [key, entry] of this.collection.entries()) {
        if (entry.lastUsed < oldestTime) {
          oldestTime = entry.lastUsed;
          oldestKey = key;
        }
      }

      if (oldestKey == null) { break; }

      this.delete(oldestKey);
    }
  }

  set (key, value, maxAge = null) {
    if (this.stores === 'set') {
      this.collection.add(value);
      return value;
    }

    const existing = this.get(key);
    const entry = {
      value: existing?.patch?.(value) ?? value,
      ttl: maxAge
        ? Date.now() + maxAge
        : null,
      lastUsed: Date.now()
    };

    this.collection.set(key, entry);

    this._ensureSizeLimit();

    return entry.value;
  }

  get (key) {
    if (this.stores === 'set') {
      return this.collection.has(key)
        ? key
        : null;
    }

    const entry = this.collection.get(key);
    if (!entry) { return null; }

    if (entry.ttl && entry.ttl <= Date.now()) {
      this.delete(key);
      return null;
    }

    this.#touch(entry);
    return entry.value;
  }

  has (key) {
    if (this.stores === 'set') {
      return this.collection.has(key);
    }

    const entry = this.collection.get(key);

    if (!entry) { return false; }

    if (entry.ttl && entry.ttl <= Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete (key) {
    return this.collection.delete(key);
  }

  clear () {
    this.collection.clear();
  }

  keys () {
    return this.collection.keys();
  }

  values () {
    if (this.stores === 'set') {
      return Array.from(this.collection.values());
    }

    return Array.from(this.collection.values(), entry => entry.value);
  }

  entries () {
    if (this.stores === 'set') {
      return Array.from(this.collection.values(), v => [v, v]);
    }

    return Array.from(this.collection.entries(), ([k, v]) => [k, v.value]);
  }

  forEach (fn) {
    if (this.stores === 'set') {
      return this.collection.forEach((v) => fn(v, v, this));
    }

    return this.collection.forEach((entry, k) => fn(entry.value, k, this));
  }

  get size () {
    return this.collection.size;
  }

  isExpired (key) {
    if (this.stores === 'set') { return false; }

    const entry = this.collection.get(key);

    return !!(entry && entry.ttl && entry.ttl <= Date.now());
  }

  sweepExpired () {
    if (this.stores === 'set') { return 0; }

    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.collection.entries()) {
      if (entry.ttl && entry.ttl <= now) {
        this.delete(key);
        removed++;
      }
    }

    return removed;
  }

  sweep (fn) {
    if (this.stores === 'set') {
      return this.collection.sweep((v) => fn(v, v));
    }

    return this.collection.sweep((entry, key) => fn(entry.value, key));
  }

  find (fn) {
    if (this.stores === 'set') {
      return this.collection.find((v) => fn(v, v));
    }

    const entry = this.collection.find((entry, key) => fn(entry.value, key));
    return entry?.value;
  }

  filter (fn) {
    if (this.stores === 'set') {
      return this.collection.filter((v) => fn(v, v));
    }

    return this.collection
      .filter((entry, key) => fn(entry.value, key))
      .map(entry => entry.value);
  }

  map (fn) {
    if (this.stores === 'set') {
      return this.collection.map((v) => fn(v, v));
    }

    return this.collection.map((entry, key) => fn(entry.value, key));
  }

  array () {
    if (this.stores === 'set') {
      return this.collection.array();
    }

    return this.collection.array().map(entry => entry.value);
  }

  first () {
    const entry = this.collection.first();

    if (!entry) { return null; }

    return this.stores === 'set'
      ? entry
      : entry.value;
  }

  last () {
    const entry = this.collection.last();

    if (!entry) { return null; }

    return this.stores === 'set'
      ? entry
      : entry.value;
  }
}

export default BaseStore;

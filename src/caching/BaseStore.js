const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

class BaseStore {
  constructor (options = {}) {
    this.store = new Set();
    this._fetched = false;
    this.ttl = options?.ttl
      ? options.ttl * 1000
      : null;
    this.maxSize = options?.maxSize > 0
      ? options.maxSize
      : Infinity;

    if (options?.sweepInterval) {
      this._sweepHandle = setInterval(() => this.sweepExpired(), options.sweepInterval);
    }
  }

  #touch (entry) {
    entry.lastUsed = Date.now();
  }

  #ensureSizeLimit () {
    while (this.size > this.maxSize) {
      let oldest = null;
      let oldestTime = Infinity;

      for (const entry of this.store) {
        if (entry.lastUsed < oldestTime) {
          oldestTime = entry.lastUsed;
          oldest = entry;
        }
      }

      if (!oldest) { break; }
      this.store.delete(oldest);
    }
  }

  #findEntry (fn) {
    for (const entry of this.store) {
      if (fn(entry.value, entry.value)) {
        return entry;
      }
    }
    return null;
  }

  set (value, maxAge = null) {
    const now = Date.now();
    const key = getKeyProperty(value);
    const existing = 'languageId' in value
      ? this.#findEntry((entry) => entry[key] === value[entry] && entry.languageId === value.languageId)
      : this.#findEntry((entry) => entry[key] === value[entry]);
    let entryValue;

    if (existing) {
      if (typeof existing.value?.patch === 'function') {
        existing.value.patch(value);
      } else if (typeof value?.constructor?.patch === 'function') {
        value.constructor.patch(existing.value, value);
      } else {
        existing.value = value;
      }

      existing.ttl = maxAge
        ? now + (maxAge * 1000)
        : this.ttl ?? existing.ttl;
      this.#touch(existing);
      entryValue = existing.value;
    } else {
      const entry = {
        value,
        ttl: maxAge
          ? now + maxAge
          : null,
        lastUsed: now
      };
      this.store.add(entry);
      entryValue = value;
    }

    this.#ensureSizeLimit();
    return entryValue;
  }

  get (idOrFunc) {
    const entry = typeof idOrFunc === 'function'
      ? this.#findEntry(idOrFunc)
      : this.#findEntry((entry) => entry[getKeyProperty(entry)] === idOrFunc);

    if (!entry) { return null; }

    if (entry.ttl && entry.ttl <= Date.now()) {
      this.store.delete(entry);
      return null;
    }

    this.#touch(entry);
    return entry.value;
  }

  has (fn) {
    const entry = this.#findEntry(fn);
    if (!entry) { return false; }

    if (entry.ttl && entry.ttl <= Date.now()) {
      this.store.delete(entry);
      return false;
    }

    return true;
  }

  delete (fn) {
    let removed = 0;
    for (const entry of Array.from(this.store)) {
      if (fn(entry.value, entry.value)) {
        this.store.delete(entry);
        removed++;
      }
    }
    return removed;
  }

  clear () {
    this._fetched = false;
    this.store.clear();
  }

  destroy () {
    if (this._sweepHandle) { clearInterval(this._sweepHandle); }
  }

  values () {
    return Array.from(this.store, (entry) => entry.value);
  }

  forEach (fn) {
    for (const entry of this.store) { fn(entry.value, entry.value, this); }
  }

  get size () {
    return this.store.size;
  }

  isExpired (value) {
    const entry = this.#findEntry(value);
    return !!(entry && entry.ttl && entry.ttl <= Date.now());
  }

  sweepExpired () {
    const now = Date.now();
    let removed = 0;
    for (const entry of Array.from(this.store)) {
      if (entry.ttl && entry.ttl <= now) {
        this.store.delete(entry);
        removed++;
      }
    }

    // All items expired reset fetched state
    if (removed && this.size === 0) {
      this._fetched = false;
    }

    return removed;
  }

  find (fn) {
    for (const entry of this.store) {
      if (fn(entry.value, entry.value)) { return entry.value; }
    }
    return null;
  }

  filter (fn) {
    const result = [];
    for (const entry of this.store) {
      if (fn(entry.value, entry.value)) { result.push(entry.value); }
    }
    return result;
  }

  map (fn) {
    const result = [];
    for (const entry of this.store) {
      result.push(fn(entry.value, entry.value));
    }
    return result;
  }

  array () {
    return Array.from(this.store, e => e.value);
  }

  first () {
    return this.store.values().next()?.value ?? null;
  }

  last () {
    return this.values().slice(-1)?.value ?? null;
  }

  toMap (keyFn) {
    const result = new Map();
    for (const entry of this.store) {
      const v = entry.value;
      result.set(keyFn(v), v);
    }
    return result;
  }
}

export default BaseStore;

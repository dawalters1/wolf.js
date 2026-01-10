const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[0];

export default class Cache {
  #store = new Set();
  #fetched = false;
  #ttl = null;
  #maxSize = Infinity;
  #sweepHandle = null;

  constructor (options = {}) {
    if (options.ttl) { this.#ttl = options.ttl * 1000; }
    if (options.maxSize > 0) { this.#maxSize = options.maxSize; }

    if (options.sweepInterval) {
      this.#sweepHandle = setInterval(() => this.sweepExpired(), options.sweepInterval);
    }
  }

  get store () {
    return this.#store;
  }

  set fetched (val) {
    this.#fetched = val;
  }

  get fetched () {
    return this.#fetched;
  }

  get size () {
    return this.#store.size;
  }

  #touch (entry) {
    entry.lastUsed = Date.now();
  }

  #ensureSizeLimit () {
    while (this.size > this.#maxSize) {
      let oldest = null;
      let oldestTime = Infinity;

      for (const entry of this.#store) {
        if (entry.lastUsed < oldestTime) {
          oldestTime = entry.lastUsed;
          oldest = entry;
        }
      }

      if (!oldest) { break; }

      this.#store.delete(oldest);
    }
  }

  #findEntryBy (fn) {
    for (const [key, entry] of this.#store) {
      if (fn(entry.value, key)) {
        return { key, entry };
      }
    }
    return null;
  }

  set (value, maxAge = null) {
    const now = Date.now();
    const key = getKeyProperty(value);

    const existing = value instanceof Object
      ? 'languageId' in value
        ? this.#findEntryBy((entry) => entry[key] === value[key] && entry.languageId === value.languageId)
        : this.#findEntryBy((entry) => entry[key] === value[key])
      : this.#findEntryBy((entry) => entry === value);

    let entryValue;

    if (existing) {
      if (typeof existing.value?.patch === 'function') {
        existing.value.patch(value);
      } else if (typeof value?.constructor?.patch === 'function') {
        value.constructor.patch(existing.value, value);
      } else {
        existing.value = value;
      }

      existing.expiresAt = maxAge
        ? now + maxAge * 1000
        : this.#ttl
          ? now + this.#ttl
          : existing.expiresAt;

      this.#touch(existing);
      entryValue = existing.value;
    } else {
      const entry = {
        value,
        expiresAt: maxAge
          ? now + maxAge * 1000
          : this.#ttl
            ? now + this.#ttl
            : null,
        lastUsed: now
      };
      this.#store.add(entry);
      entryValue = value;
    }

    this.#ensureSizeLimit();
    return entryValue;
  }

  setAll (values, maxAge) {
    values.forEach((value) => this.set(value, maxAge));

    this.fetched = true;
  }

  get (keyOrFn) {
    const result = typeof keyOrFn === 'function'
      ? this.#findEntryBy(keyOrFn)
      : { key: keyOrFn, entry: this.#store.get(keyOrFn) };

    if (!result || !result.entry) { return null; }

    const { key, entry } = result;

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.#store.delete(key);
      if (this.size === 0) { this.#fetched = false; }
      return null;
    }

    this.#touch(key, entry);
    return entry.value;
  }

  has (keyOrFn) {
    const result = typeof keyOrFn === 'function'
      ? this.#findEntryBy(keyOrFn)
      : { key: keyOrFn, entry: this.#store.get(keyOrFn) };

    if (!result || !result.entry) { return false; }

    const { key, entry } = result;

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.#store.delete(key);
      if (this.size === 0) { this.#fetched = false; }
      return false;
    }

    return true;
  }

  delete (keyOrFn) {
    if (typeof keyOrFn !== 'function') {
      const removed = this.#store.delete(keyOrFn);
      if (removed && this.size === 0) { this.#fetched = false; }
      return removed;
    }

    let removed = 0;
    for (const [key, entry] of Array.from(this.#store)) {
      if (keyOrFn(entry.value, key)) {
        this.#store.delete(key);
        removed++;
      }
    }

    if (removed && this.size === 0) { this.#fetched = false; }
    return removed;
  }

  clear (keepState) {
    this.#fetched = keepState
      ? this.fetched
      : false;
    this.#store.clear();
  }

  destroy () {
    if (this.#sweepHandle) { clearInterval(this.#sweepHandle); }
  }

  values () {
    return Array.from(this.#store, (entry) => entry.value);
  }

  forEach (fn) {
    for (const entry of this.#store) { fn(entry.value, entry.value, this); }
  }

  isExpired (value) {
    const entry = this.#findEntryBy(value);
    return !!(entry && entry.expiresAt && entry.expiresAt <= Date.now());
  }

  sweepExpired () {
    const now = Date.now();
    let removed = 0;

    for (const entry of Array.from(this.#store)) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.#store.delete(entry);
        removed++;
      }
    }

    if (removed && this.size === 0) { this.#fetched = false; }
    return removed;
  }

  find (fn) {
    for (const entry of this.#store) {
      if (fn(entry.value, entry.value)) { return entry.value; }
    }
    return null;
  }

  filter (fn) {
    const result = [];
    for (const entry of this.#store) {
      if (fn(entry.value, entry.value)) { result.push(entry.value); }
    }
    return result;
  }

  map (fn) {
    const result = [];
    for (const entry of this.#store) {
      result.push(fn(entry.value, entry.value));
    }
    return result;
  }

  array () {
    return Array.from(this.#store, (entry) => entry.value);
  }

  first () {
    return this.#store.values().next().value?.value ?? null;
  }

  last () {
    const arr = Array.from(this.#store);
    return arr.length
      ? arr[arr.length - 1].value
      : null;
  }

  toMap (keyFn) {
    const result = new Map();
    for (const entry of this.#store) {
      const v = entry.value;
      result.set(keyFn(v), v);
    }
    return result;
  }
}

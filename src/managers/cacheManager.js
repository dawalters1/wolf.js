import ExpiryMap from 'expiry-map';

const getKeyProperty = (obj) => {
  const properties = Object.getOwnPropertyNames(obj);

  return properties[1];
};

class CacheManager {
  constructor (ttl = null) {
    this.ttl = ttl;
    this.store = ttl === null
      ? new Map()
      : new ExpiryMap(ttl * 1000);
    this._fetched = false;
    this.timeout = undefined;
  }

  get fetched () {
    return this._fetched;
  }

  set fetched (value) {
    this._fetched = value;

    if (!this.ttl) { return; }

    clearTimeout(this.timeout);

    if (value) {
      this.timeout = setTimeout(() => {
        this._fetched = false;
      }, this.ttl * 1000);
    }
  }

  set (value) {
    if (this.ttl) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this._fetched = false;
      }, this.ttl * 1000);
    }

    const key = value[getKeyProperty(value)];
    const existing = this.get(key);

    if (existing?.patch) {
      this.store.set(key, existing.patch(value));
    } else {
      this.store.set(key, value);
    }

    return this.store.get(key);
  }

  setAll (values) {
    return values.map((value) => this.set(value));
  }

  get (key) {
    return this.store.get(key) ?? null;
  }

  getAll (keys) {
    return keys.map((key) => this.get(key));
  }

  has (key) {
    return this.store.has(key);
  }

  mhas (keys) {
    return keys.map((key) => this.has(key));
  }

  delete (key) {
    return this.store.delete(key);
  }

  deleteAll (keys) {
    return keys.map((key) => this.delete(key));
  }

  clear () {
    this.store.clear();
    this.fetched = false;
  }

  size () {
    return this.store.size;
  }

  keys () {
    return Array.from(this.store.keys());
  }

  values () {
    return Array.from(this.store.values());
  }

  entries () {
    return Array.from(this.store.entries());
  }
}

export default CacheManager;

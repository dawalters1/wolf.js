import ExpiryMap from 'expiry-map';

const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

// TODO: refactor/restructure to better support languages, key/languageId approach seems eh
// TODO: respect maxAge provided by the server
class CacheManager {
  constructor (ttl = null) {
    this.ttl = ttl;
    this.store = ttl === null
      ? new Map()
      : new ExpiryMap(ttl * 1000);
    this._fetched = false;
    this.timeout = undefined;
  }

  #createKey (key, languageId = null) {
    return languageId
      ? `${key}.languageId:${languageId}`
      : key;
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

    const key = this.#createKey(value[getKeyProperty(value)], value.languageId ?? null);

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

  get (key, languageId = null) {
    return this.store.get(this.#createKey(key, languageId)) ?? null;
  }

  getAll (keys, languageId = null) {
    return keys.map((key) => this.get(key, languageId));
  }

  has (key, languageId = null) {
    return this.store.has(this.#createKey(key, languageId));
  }

  mhas (keys, languageId = null) {
    return keys.map((key) => this.has(key, languageId));
  }

  delete (key, languageId = null) {
    return this.store.delete(this.#createKey(key, languageId));
  }

  deleteAll (keys, languageId = null) {
    return keys.map((key) => this.delete(key, languageId));
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

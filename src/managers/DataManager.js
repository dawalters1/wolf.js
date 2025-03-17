import ExpiryMap from 'expiry-map';

class DataManager {
  constructor (key = 'id', ttl = 3600) {
    this._key = key;

    this._cache = ttl <= 0
      ? new Map()
      : new ExpiryMap(ttl);
  }

  get cache () {
    return this._cache;
  }

  get (key, _default = null) {
    return this._cache.get(key) ?? _default;
  }

  _add (value, ...additionalArgs) {
    const existing = this._cache.get(value[this._key]);

    existing
      ? existing?._patch(value, ...additionalArgs)
      : this.cache.set(value[this._key], value);

    return existing ?? value;
  }

  _delete (key) {
    return this._cache.delete(key);
  }
}

export default DataManager;

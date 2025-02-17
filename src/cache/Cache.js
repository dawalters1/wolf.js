import CacheInstanceType from '../constants/CacheInstanceType.js';

// This is a mess... but universal
class Cache {
  constructor (key, cacheInstanceType) {
    this.cache = new Map();
    this.key = key;
    this.instance = cacheInstanceType;
  }

  _patch (oldData, newData) {
    // No object provided to patch
    if (!oldData) { return newData; }

    Object.keys(newData)
      .forEach((key) => {
        oldData[key] = newData[key];
      });

    return oldData;
  };

  clear () {
    this.cache.clear();
  }

  list (...args) {
    if (this.instance === CacheInstanceType.MAP) {
      const key = args[0];

      if (key === null) { return this.cache.values(); }

      const cached = (Array.isArray(key) ? key : [key])
        .map((value) => this.cache?.get(value) ?? null);

      return Array.isArray(key)
        ? cached
        : cached[0];
    }

    return this.cache.values();
  }

  get (...args) {
    // Expecting cache layout of new Map(key, new Map(this.key, OBJ))
    if (this.instance === CacheInstanceType.MAP) {
      const key = args[0];
      const values = args[1] ?? null;

      const cache = this.cache.get(key) ?? null;

      if (cache === null) { return null; }

      if (values === null) { return cache; }

      const cached = (Array.isArray(values) ? values : [values])
        .map((value) => cache?.get(value) ?? null);

      return Array.isArray(values)
        ? cached
        : cached[0];
    }

    // Expecting cache layout of new Map(key, OBJ)
    const keys = args[0];

    const cached = (Array.isArray(keys) ? keys : [keys])
      .map((value) => this.cache.get(value) ?? null);

    return Array.isArray(keys)
      ? cached
      : cached[0];
  }

  // Set values
  set (...args) {
    // Expecting cache layout of new Map(key, new Map(this.key, OBJ))
    if (this.instance === CacheInstanceType.MAP) {
      const key = args[0];
      const values = args[1] ?? null;

      if (!this.cache.has(key)) { this.cache.set(key, new Map()); }

      const cache = this.cache.get(key);

      (Array.isArray(values) ? values : [values])
        .map((value) =>
          cache.set(
            value[this.key],
            this._patch(
              cache.get(value[this.key]) ?? null,
              value
            )
          )
        );

      return Array.isArray(values)
        ? values.map((value) => cache.get(value[this.key]))
        : cache.get(values[this.key]);
    }

    // Expecting cache layout of new Map(key, OBJ)

    const values = args[0];

    (Array.isArray(values) ? values : [values])
      .map((value) =>
        this.cache?.set(
          value[this.key],
          this._patch(
            this.cache.get(value[this.key]) ?? null,
            value
          )
        )
      );

    return Array.isArray(values)
      ? values.map((value) => this.cache.get(value[this.key]))
      : this.cache.get(values[this.key]);
  }
}

export default Cache;

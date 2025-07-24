
const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

class CacheManager {
  constructor () {
    this.store = new Map();

    this.fetched = false;
    setInterval(() => {
      for (const [key, value] of this.store) {
        if (value.expiresAt && value.expiresAt <= Date.now()) {
          this.store.delete(key);
        }
      }

      if (this.store.size === 0) {
        this.fetched = false;
      }
    }, 120);
  }

  getKey (...args) {
    if (typeof args[0] === 'number') {
      const languageId = args[1];

      return languageId
        ? `${args[0]}.languageId:${languageId}`
        : args[0];
    }
    const languageId = args[0].languageId;
    const primaryKey = getKeyProperty(args[0]);

    return languageId
      ? `${primaryKey}.languageId:${languageId}`
      : primaryKey;
  }

  get (key) {
    const cached = this.get(key) ?? null;

    if (!cached) { return null; }

    if (cached?.expiresAt && cached.expiresAt < Date.now()) { return null; }

    return cached.values;
  }

  mGet (keys) {
    return keys.map((key) => this.get(key));
  }

  set (key, value, maxAge) {
    return this.store.set(
      key,
      {
        value,
        expiresAt: maxAge
          ? Date.now() + (maxAge * 1000)
          : null
      }
    );
  }

  mSet (keyValues, maxAge) {
    return keyValues.map((keyValue) => this.set(keyValue[0], keyValue[1], maxAge));
  }

  delete (key) {
    return this.store.delete(key);
  }

  has (key) {
    return this.store.has(key);
  }

  mHas (keys) {
    return keys.map((key) => this.has(key));
  }

  clear () {
    return this.store.clear();
  }

  size () {
    return this.store.size();
  }

  values () {
    return [...this.store.values()].map((value) => value.value);
  }

  keys () {
    return [...this.store.keys()];
  }
}

export default CacheManager;

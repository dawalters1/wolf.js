
const getKeyProperty = (obj) => Object.getOwnPropertyNames(obj)[1];

class CacheManager {
  constructor () {
    this.store = new Map();
    this.fetched = false;

    setInterval(() => {
      const sizePrior = this.store.size;

      for (const [id, value] of this.store) {
        const { expiresAt } = value;

        if (expiresAt && expiresAt <= Date.now()) {
          this.store.delete(id);
        }
      }

      if (sizePrior > 0 && this.store.size === 0) {
        this.fetched = false;
      }
    }, 120);
  }

  resolveId (...args) {
    if (args.length === 2) {
      return `${args[1]}:${args[0]}`;
    }

    const idOrObject = args[0];

    if (typeof idOrObject === 'number') { return idOrObject; };
    ;
    const id = idOrObject[getKeyProperty(idOrObject)];

    if (!('languageId' in idOrObject)) { return id; }

    return `${idOrObject.languageId}:${id}`;
  }

  set (value, maxAge = null) {
    const id = this.resolveId(value);

    return this.store.set(
      id,
      {
        value,
        expiresAt: maxAge
          ? Date.now() + (maxAge * 1000)
          : null
      }
    ).get(id)?.value ?? null;
  }

  get (...args) {
    return this.store.get(this.resolveId(...args))?.value ?? null;
  }

  has (...args) {
    return this.store.has(this.resolveId(...args));
  }

  delete (...args) {
    return this.store.delete(...args);
  }

  clear () {
    this.store.clear();
    this.fetched = false;
  }

  get size () {
    return this.store.size;
  }

  values () {
    return [...this.store.values()].map((value) => value.value);
  }

  keys () {
    return [...this.store.keys()];
  }
}

export default CacheManager;

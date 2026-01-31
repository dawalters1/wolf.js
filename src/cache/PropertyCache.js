import ExpiringPropertyCacheManager from './ExpiringPropertyCacheManager.js';

export default class PropertyCache {
  #fetched = false;
  #value = null;
  #expiresAt = 0;

  constructor (options = {}) {
    const { ttl = 3600, autoRefresh = false } = options;
    this.ttl = ttl;
    this.autoRefresh = autoRefresh;

    ExpiringPropertyCacheManager.register?.(this);
  }

  set fetched (value) {
    this.#fetched = value;
  }

  get fetched () {
    if (this.isExpired()) { this.clear(); }
    return this.#fetched;
  }

  get value () {
    if (this.isExpired()) {
      this.clear();
      return null;
    }

    if (this.autoRefresh && this.#value !== null) {
      this.refresh();
    }

    return this.#value;
  }

  set value (val) {
    if (val === null || val === undefined) {
      this.clear();
      return;
    }

    if (this.#value && typeof this.#value.patch === 'function') {
      this.#value.patch(val);
    } else {
      this.#value = val;
    }

    this.#expiresAt = Date.now() + this.ttl * 1000;
    this.#fetched = true;
  }

  isExpired () {
    return this.#value !== null && Date.now() >= this.#expiresAt;
  }

  clear () {
    this.#value = null;
    this.#expiresAt = 0;
    this.#fetched = false;
  }

  refresh () {
    if (this.#value !== null) {
      this.#expiresAt = Date.now() + this.ttl * 1000;
    }
  }

  get remainingTime () {
    if (this.isExpired() || this.#value === null) { return 0; }
    return Math.max(0, this.#expiresAt - Date.now());
  }

  get expiresAt () {
    return this.#expiresAt;
  }
}

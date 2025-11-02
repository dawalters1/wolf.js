class ExpiringPropertyManager {
  static #properties = new Set();
  static #interval = null;
  static #intervalMs = 1000;

  static register (prop) {
    if (!prop) { return; }
    this.#properties.add(prop);
    this.#startInterval();
  }

  static unregister (prop) {
    if (!prop) { return; }
    this.#properties.delete(prop);
    if (this.#properties.size === 0) { this.stop(); }
  }

  static #startInterval () {
    if (this.#interval) { return; }
    this.#interval = setInterval(() => {
      for (const prop of this.#properties) {
        if (!prop?.expiresAt || !prop.fetched) { continue; }
        if (prop.isExpired()) { prop.clear(); }
      }
      if (this.#properties.size === 0) { this.stop(); }
    }, this.#intervalMs);
  }

  static stop () {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }
  }

  static clearAll () {
    for (const prop of this.#properties) { prop.clear(); }
    this.stop();
    this.#properties.clear();
  }

  static setSweepInterval (ms) {
    if (typeof ms !== 'number' || ms <= 0) { return; }
    this.#intervalMs = ms;
    if (this.#interval) {
      this.stop();
      this.#startInterval();
    }
  }
}

export default ExpiringPropertyManager;

class ExpiringPropertyManager {
  static #properties = new Set();
  static #interval = null;
  static #intervalMs = 1000;

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

  static register (property) {
    if (!property) { return; }
    this.#properties.add(property);
    this.#startInterval();
  }

  static unregister (property) {
    if (!property) { return; }
    this.#properties.delete(property);
    if (this.#properties.size === 0) { this.stop(); }
  }

  static stop () {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }
  }

  static clearAll () {
    for (const property of this.#properties) { property.clear(); }
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

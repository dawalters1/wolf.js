import ExpiringPropertyManager from './expiringPropertyManager.js';

class ExpiringProperty {
  constructor (ttl = 3600) {
    this.ttl = ttl;
    this._value = null;
    this.expiresAt = 0;
    this.fetched = false;

    ExpiringPropertyManager.register(this);
  }

  get value () {
    if (this.isExpired()) {
      this.clear();
    }
    return this._value;
  }

  set value (val) {
    if (val === null) {
      this._value = null;
      this.expiresAt = 0;
      this.fetched = false;
    } else {
      this._value = val;
      this.expiresAt = Date.now() + this.ttl;
      this.fetched = true;
    }
  }

  isExpired () {
    return this._value !== null && Date.now() >= this.expiresAt;
  }

  clear () {
    this.value = null;
  }
}

export default ExpiringProperty;

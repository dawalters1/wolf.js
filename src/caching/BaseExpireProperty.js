import ExpiringPropertyManager from './ExpiringPropertyManager.js';

class BaseExpireProperty {
  constructor (options) {
    this.ttl = options?.ttl ?? 3600;
    this._value = null;
    this.expiresAt = 0;
    this._fetched = false;

    ExpiringPropertyManager.register(this);
  }

  get fetched () {
    if (this.isExpired()) { this.clear(); }

    return this._fetched;
  }

  get value () {
    if (this.isExpired()) { this.clear(); }

    return this._value;
  }

  set value (val) {
    if (val === null) {
      this._value = null;
      this.expiresAt = 0;
      this._fetched = false;
    } else {
      if (this._value) {
        this._value?.patch(val);
      } else {
        this._value = val;
      }
      this.expiresAt = Date.now() + (this.ttl * 1000);
      this._fetched = true;
    }
  }

  isExpired () {
    return this._value !== null && Date.now() >= this.expiresAt;
  }

  clear () {
    this.value = null;
  }
}

export default BaseExpireProperty;

import ExpiringPropertyManager from './expiringPropertyManager';

class ExpiringProperty<T> {
  fetched: boolean = false;
  private _value: T | null = null;
  private expiresAt = 0;

  constructor (private ttl: number = 3600) {
    ExpiringPropertyManager.register(this);
  }

  get value (): T | null {
    if (this.isExpired()) {
      this.clear();
    }
    return this._value;
  }

  set value (val: T | null) {
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

  isExpired (): boolean {
    return this._value !== null && Date.now() >= this.expiresAt;
  }

  clear () {
    this.value = null;
  }
}

export default ExpiringProperty;

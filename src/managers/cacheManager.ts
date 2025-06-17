import BaseEntity from '../structures/baseEntity.ts';
import ExpiryMap from 'expiry-map';
import { getKeyProperty } from '../decorators/key.ts';

export class CacheManager<T extends BaseEntity> {
  private store: Map<number, T> | ExpiryMap<number, T>;
  private _fetched = false;
  private timeout?: NodeJS.Timeout;

  /**
   * @param ttl Time to live (TTL) in seconds. If null, cache is permanent.
   */
  constructor (private ttl: number | null = null) {
    this.store = ttl === null ? new Map() : new ExpiryMap(ttl * 1000);
  }

  get fetched (): boolean {
    return this._fetched;
  }

  set fetched (value: boolean) {
    this._fetched = value;

    if (!this.ttl) {
      return;
    }

    clearTimeout(this.timeout);

    if (value) {
      this.timeout = setTimeout(() => {
        this._fetched = false;
      }, this.ttl * 1000);
    }
  }

  /**
   * Set a single value in the cache.
   */
  set (value: T): T {
    if (this.ttl) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this._fetched = false;
      }, this.ttl * 1000);
    }

    const key = value[getKeyProperty(value)] as number;
    const existing = this.get(key);

    if (existing?.patch) {
      this.store.set(key, existing.patch(value));
    } else {
      this.store.set(key, value);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.store.get(key)!;
  }

  /**
   * Set multiple values in the cache.
   */
  setAll (values: T[]): T[] {
    return values.map((value) => {
      return this.set(value);
    });
  }

  /**
   * Get a value by key.
   */
  get (key: number): T | null {
    return this.store.get(key) ?? null;
  }

  /**
   * Get multiple values by an array of keys.
   */
  getAll (keys: number[]): (T | null)[] {
    return keys.map((key) => {
      return this.get(key);
    });
  }

  /**
   * Check if a key exists in the cache.
   */
  has (key: number): boolean {
    return this.store.has(key);
  }

  /**
   * Check if multiple keys exist in the cache.
   */
  mhas (keys: number[]): boolean[] {
    return keys.map((key) => {
      return this.has(key);
    });
  }

  /**
   * Delete a single key from the cache.
   */
  delete (key: number): boolean {
    const result = this.store.delete(key);

    if (this.size() === 0) {
      this.fetched = false;
    }

    return result;
  }

  /**
   * Delete multiple keys from the cache.
   */
  deleteAll (keys: number[]): boolean[] {
    return keys.map((key) => {
      return this.delete(key);
    });
  }

  /**
   * Clear the entire cache.
   */
  clear (): void {
    this.store.clear();
    this.fetched = false;
  }

  /**
   * Get the number of items in the cache.
   */
  size (): number {
    return this.store.size;
  }

  /**
   * Get all keys from the cache.
   */
  keys (): number[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get all values from the cache.
   */
  values (): T[] {
    return Array.from(this.store.values());
  }

  /**
   * Get all entries from the cache.
   */
  entries (): [number, T][] {
    return Array.from(this.store.entries());
  }
}

export default CacheManager;


import { getKeyProperty } from '../decorators/key.ts';

export class CacheManager<T, S extends Set<T> | Map<number, T>> {
  store: S;
  fetched: boolean = false;

  constructor (store: S) {
    this.store = store;
  }

  // #region add methods for set
  add (this: CacheManager<T, Set<T>>, value: T): boolean {
    if (this.store.has(value)) { return false; }

    return this.store.add(value).has(value);
  }

  madd (this: CacheManager<T, Set<T>>, values: T[]): boolean[] {
    return values.map((value) => this.add(value));
  }

  // #endregion
  // #region set methods for map
  set (this: CacheManager<T, Map<number, T>>, value: T): T {
    const key = value[getKeyProperty(value as object)] as number;

    const existing = this.get(key);

    if (existing) {
      return (existing as any)._patch(value);
    }

    return this.store.set(key, value).get(key) as T;
  }

  mset (this: CacheManager<T, Map<number, T>>, values: T[]): T[] {
    return values.map((value) => this.set(value));
  }

  // #endregion
  // #region get methods
  get (this: CacheManager<T, Map<number, T>>, key: number): T | null {
    return this.store.get(key) ?? null;
  }

  mget (this: CacheManager<T, Map<number, T>>, keys: number[]): (T | null)[] {
    return keys.map((key) => this.store.get(key) ?? null);
  }

  // #endregion
  has (key: T | number): boolean {
    if (this.store instanceof Map) {
      return this.store.has(key as number);
    }

    return this.store.has(key as T);
  }

  mhas (keys: number[]): boolean[] {
    return keys.map((key) => this.has(key));
  }

  delete (key: T | number): boolean {
    if (this.store instanceof Map) {
      return this.store.delete(key as number);
    }

    return this.store.delete(key as T);
  }

  mdelete (keys: number[]): boolean[] {
    return keys.map((key) => this.delete(key));
  }

  clear (): void {
    this.store.clear();
    this.fetched = false;
  }

  size (): number {
    return this.store.size;
  }

  keys (this: CacheManager<T, Map<number, T>>): number[] {
    return [...this.store.keys()];
  }

  values (): T[] {
    return [...this.store.values()];
  }

  entries (this: CacheManager<T, Map<number, T>>): [number, T][] {
    return [...this.store.entries()];
  }
}

export default CacheManager;

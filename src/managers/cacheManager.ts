import { getKeyProperty } from '../decorators/key.ts';
import BaseEntity from '../structures/baseEntity.ts';

export class CacheManager<T extends BaseEntity> {
  store: Map<number, T> = new Map();
  fetched: boolean = false;

  // #endregion
  // #region set methods for map
  set (value: T) {
    const key = value[getKeyProperty(value)] as number;

    const existing = this.get(key);

    if (existing && existing.patch) {
      return existing.patch(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.store.set(key, value).get(key)!;
  }

  setAll (values: T[]): T[] {
    return values.map((value) => this.set(value));
  }

  // #endregion
  // #region get methods
  get (key: number) {
    return this.store.get(key) ?? null;
  }

  getAll (keys: number[]): (T | null)[] {
    return keys.map((key) => this.store.get(key) ?? null);
  }

  // #endregion
  has (key: number): boolean {
    return this.store.has(key);
  }

  mhas (keys: number[]): boolean[] {
    return keys.map((key) => this.has(key));
  }

  delete (key: number): boolean {
    return this.store.delete(key);
  }

  deleteAll (keys: number[]): boolean[] {
    return keys.map((key) => this.delete(key));
  }

  clear (): void {
    this.store.clear();
    this.fetched = false;
  }

  size (): number {
    return this.store.size;
  }

  keys (): number[] {
    return [...this.store.keys()];
  }

  values (): T[] {
    return [...this.store.values()];
  }

  entries (): [number, T][] {
    return [...this.store.entries()];
  }
}

export default CacheManager;

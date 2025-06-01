import 'reflect-metadata';

const KEY_METADATA = Symbol('key_property');

export function getKeyProperty<T extends object, K extends keyof T> (target: T): K {
  return Reflect.getMetadata(KEY_METADATA, target.constructor.prototype) as K;
}
export function key (target: object, propertyKey: string | symbol) {
  Reflect.defineMetadata(KEY_METADATA, propertyKey, target);
}

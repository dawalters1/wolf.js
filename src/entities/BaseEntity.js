import _ from 'lodash';

export default class BaseEntity {
  #client;
  /**
   *
   * @param {import('../client/WOLF.js').default} client
   */
  constructor (client) {
    this.#client = client;
  }

  get client () {
    return this.#client;
  }

  /** @internal */
  patch (newData, oldData = null) {
    oldData = oldData ?? this;

    if (newData === undefined) {
      throw new Error('Failed to patch: newData is undefined');
    }

    const allowedKeys = Object.keys(oldData);

    for (const key of Object.keys(newData)) {
      if (!allowedKeys.includes(key)) { continue; }

      const newValue = newData[key];
      const oldValue = oldData[key];

      if (newValue === undefined) {
        Reflect.deleteProperty(oldData, key);
        continue;
      }

      if (
        newValue === null ||
      Array.isArray(newValue) ||
      newValue instanceof Set
      ) {
        oldData[key] = newValue;
        continue;
      }

      if (
        typeof newValue === 'object' &&
      typeof oldValue === 'object' &&
      oldValue !== null
      ) {
        this.patch(newValue, oldValue);
        continue;
      }

      oldData[key] = newValue;
    }
  }

  /** @internal */
  clone () {
    return _.clone(this);
  }

  /** @internal */

  json () {
    return _.omit(this, 'client');
  }
}

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
    oldData = oldData || this;

    const allowedKeys = Object.keys(oldData);

    if (newData === undefined || newData === null) {
      throw new Error('Failed to patch current:', JSON.stringify(this), 'old', JSON.stringify(oldData), 'new', JSON.stringify(newData));
    }

    const newKeys = Object.keys(newData).filter((key) => allowedKeys.includes(key));

    for (const key of newKeys) {
      const newValue = newData[key];
      const oldValue = oldData[key];

      if (newValue === undefined) {
        Reflect.deleteProperty(this, key);
      } else if (oldValue === null || Array.isArray(newValue) || newValue instanceof Set) {
        oldData[key] = newValue;
      } else if (typeof newValue === 'object') {
        this.patch(newValue, oldValue);
      } else {
        oldData[key] = newValue;
      }
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

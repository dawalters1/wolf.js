import _ from 'lodash';

export default class BaseEntity {
  #client;
  constructor (client) {
    this.#client = client;
  }

  get client () {
    return this.#client;
  }

  /** @internal */
  patch (newData, oldData = null) {
    oldData = oldData || this;

    for (const key in newData) {
      const newValue = newData[key];
      const oldValue = oldData[key];

      if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
        if (!oldValue || typeof oldValue !== 'object' || Array.isArray(oldValue)) {
          oldData[key] = {};
        }
        this.patch(newValue, oldData[key]);
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

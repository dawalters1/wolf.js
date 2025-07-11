import _ from 'lodash';

class BaseEntity {
  /**
 * Creates an instance of BaseEntity.
 **
 * @constructor
 * @param {import('../client/WOLF.js').default} client The client instance
 */
  constructor (client) {
    this.client = client;
  }

  /** @internal */
  patch (_entity, ..._args) {
    // Implementation can be added here if needed
  }

  /** @internal */
  clone () {
    return _.clone(this);
  }
}

export default BaseEntity;

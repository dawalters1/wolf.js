import _ from 'lodash';

class BaseEntity {
  constructor (client) {
    this.client = client;
  }

  patch (entity, ...args) {
    // Implementation can be added here if needed
  }

  clone () {
    return _.clone(this);
  }
}

export default BaseEntity;

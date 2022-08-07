import _ from 'lodash';
class Base {
  constructor (client) {
    this.client = client;
  }

  _patch (data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  toJSON () {
    return _.omit(this, ['client']);
  }
}
export default Base;

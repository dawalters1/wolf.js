const Base = require('../Base');
const Category = require('./Category');
const Group = require('./Group');
const Subscriber = require('./Subscriber');

class Achievement extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);

    this.category = new Category(this.client);

    this.group = new Group(client);
    this.subscriber = new Subscriber(client);
  }
}

module.exports = Achievement;

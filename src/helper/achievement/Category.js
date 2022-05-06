const Base = require('../Base');

class Category extends Base {
  constructor (client) {
    super(client, 'id');
  }
}

module.exports = Category;

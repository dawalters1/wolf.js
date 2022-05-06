const Base = require('../Base');

// const validator = require('../../validator');
// const WOLFAPIError = require('../../models/WOLFAPIError');
// const { Command } = require('../../constants');

// const models = require('../../models');

class Subscriber extends Base {
  constructor (client) {
    super(client, 'id');
  }
}

module.exports = Subscriber;

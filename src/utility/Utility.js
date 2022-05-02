const ArrayUtility = require('./Array');
const Download = require('./Download');
const Group = require('./Group/Group');
const NumberUtility = require('./Number');
const StringUtility = require('./String');
const Timer = require('./Timer');

class Utility {
  constructor (client) {
    this.client = client;

    this.array = new ArrayUtility();
    this.download = new Download();
    this.group = new Group();
    this.number = new NumberUtility();
    this.string = new StringUtility();
    this.timer = new Timer(client);
  }

  delay (time, type = 'milliseconds') {

  }

  toReadableTime (time, type = 'milliseconds') {

  }
}

module.exports = Utility;

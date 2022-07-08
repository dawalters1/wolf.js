const Base = require('./Base');

class CharmSelected extends Base {
  constructor (client, data) {
    super(client);

    this.charmId = data.charmId;
    this.position = data.position;
  }

  toJSON () {
    return {
      charmId: this.charmId,
      position: this.position
    };
  }
}

module.exports = CharmSelected;

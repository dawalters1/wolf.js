const Base = require('./Base');

class GroupAudioConfig extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.enabled = data.enabled;
    this.stageId = data.stageId;
    this.minRepLevel = data.minRepLevel;
  }
  // TODO: Methods
}

module.exports = GroupAudioConfig;

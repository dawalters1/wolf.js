const Base = require('./Base');
const GroupAudioConfig = require('./GroupAudioConfig');
const GroupAudioCounts = require('./GroupAudioCounts');
const GroupExtended = require('./GroupExtended');
const GroupMessageConfig = require('./GroupMessageConfig');

class Group extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.hash = data.hash;
    this.name = data.name;
    this.description = data.description;
    this.reputation = data.description;
    this.owner = data.owner;
    this.membersCount = data.members;
    this.official = data.official;
    this.peekable = data.peekable;
    this.premium = data.premium;
    this.reputation = data.reputation;
    this.icon = data.icon;

    this.extended = new GroupExtended(client, data.extended);
    this.audioCounts = new GroupAudioCounts(client, data.audioCounts);
    this.audioConfig = new GroupAudioConfig(client, data.audioConfig);
    this.messageConfig = new GroupMessageConfig(client, data.messageConfig);
  }
  // TODO: Methods
}

module.exports = Group;

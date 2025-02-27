import Base from './Base.js';

class ChannelExtended extends Base {
  constructor (client, data) {
    super(client);

    this.discoverable = data?.discoverable;
    this.advancedAdmin = data?.advancedAdmin;
    this.locked = data?.locked;
    this.questionable = data?.questionable;
    this.entryLevel = data?.entryLevel;
    this.passworded = data?.passworded;
    this.language = data?.language;
    this.longDescription = data?.longDescription;
    this.category = data?.category;
  }
}

export default ChannelExtended;

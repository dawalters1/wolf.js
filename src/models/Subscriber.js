const Base = require('./Base');
const SubscriberExtended = require('./SubscriberExtended');
const SubscriberSelectedCharm = require('./SubscriberSelectedCharm');

const { Language } = require('../constants/Language');

class Subscriber extends Base {
  constructor (client, data) {
    super(client);

    this.charms = new SubscriberSelectedCharm(client, data.charms);
    this.deviceType = data.deviceType;
    this.extended = new SubscriberExtended(client, data.extended);
    this.hash = data.hash;
    this.icon = data.icon;
    this.id = data.id;
    this.nickname = data.nickname;
    this.onlineState = data.onlineState;
    this.reputation = data.reputation;
    this.privileges = data.privileges;
    this.status = data.status;

    this.language = client.utility.toLanguageKey(this.extended?.language ?? Language.ENGLISH);
  }

  toContact () {
    return {
      id: this.id,
      additionalInfo: {
        hash: this.hash,
        nicknameShort: this.nickname.slice(0, 6),
        onlineState: this.onlineState,
        privilieges: this.privilieges
      }
    };
  }
}

module.exports = Subscriber;

const EventEmitter = require('events');

// #region Helpers

const Achievement = require('../helper/achievement/Achievement');
const Banned = require('../helper/banned/Banned');
const Charm = require('../helper/charm/Charm');
const Contact = require('../helper/contact/Contact');
const Discovery = require('../helper/discovery/Discovery');
const Group = require('../helper/group/Group');
const Messaging = require('../helper/messaging/Messaging');
const Notification = require('../helper/notification/Notification');
const Phrase = require('../helper/phrase/Phrase');
const Stage = require('../helper/stage/Stage');
const Store = require('../helper/store/Store');
const Tipping = require('../helper/tipping/Tipping');
const Utility = require('../utility/Utility');

// #endregion
class WOLF extends EventEmitter {
  constructor () {
    super();

    this.achievement = new Achievement(this);
    this.banned = new Banned(this);
    this.charm = new Charm(this);
    this.contact = new Contact(this);
    this.discovery = new Discovery(this);
    this.group = new Group(this);
    this.messaging = new Messaging(this);
    this.notification = new Notification(this);
    // this.phrase = new Phrase(this);
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.tipping = new Tipping(this);

    this.utility = new Utility(this);
  }
}

module.exports = WOLF;

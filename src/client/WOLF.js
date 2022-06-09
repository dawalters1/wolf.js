const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const EventEmitter = require('events');

const Websocket = require('./websocket/Websocket');

// #region Helpers

const Achievement = require('../helper/achievement/Achievement');
const Banned = require('../helper/banned/Banned');
const Charm = require('../helper/charm/Charm');
const Contact = require('../helper/contact/Contact');
const Discovery = require('../helper/discovery/Discovery');
const Event = require('../helper/event/Event');
const Group = require('../helper/group/Group');
const Messaging = require('../helper/messaging/Messaging');
const Notification = require('../helper/notification/Notification');
// const Phrase = require('../helper/phrase/Phrase');
const Stage = require('../helper/stage/Stage');
const Store = require('../helper/store/Store');
const Subscriber = require('../helper/subscriber/Subscriber');
const Tipping = require('../helper/tipping/Tipping');
const Utility = require('../utility/Utility');
const { validateBotConfig } = require('../utils/config');

// #endregion
class WOLF extends EventEmitter {
  constructor () {
    super();

    validateBotConfig(this, yaml.parse(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8')));

    this.websocket = new Websocket(this);

    this.achievement = new Achievement(this);
    this.banned = new Banned(this);
    this.charm = new Charm(this);
    this.contact = new Contact(this);
    this.discovery = new Discovery(this);
    this.event = new Event(this);
    this.group = new Group(this);
    this.messaging = new Messaging(this);
    this.notification = new Notification(this);
    // this.phrase = new Phrase(this);
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.subscriber = new Subscriber(this);
    this.tipping = new Tipping(this);

    this.utility = new Utility(this);
  }
}

module.exports = WOLF;

/* eslint-disable accessor-pairs */
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const event = require('../../constants/event');
const internal = require('../../constants/internal');

module.exports = class EventManager {
  constructor (bot) {
    this._bot = bot;
    this._eventEmitter = new EventEmitter();
    this._handlers = {};
  }

  connecting (fn) { this._eventEmitter.on(internal.CONNECTING, fn); };

  connected (fn) { this._eventEmitter.on(internal.CONNECTED, fn); }

  connectionError (fn) { this._eventEmitter.on(internal.CONNECTION_ERROR, fn); }

  disconnected (fn) { this._eventEmitter.on(internal.DISCONNECTED, fn); }

  welcomed (fn) { this._eventEmitter.on(event.WELCOME, fn); }

  loginSuccess (fn) { this._eventEmitter.on(internal.LOGIN_SUCCESS, fn); }

  loginFailed (fn) { this._eventEmitter.on(internal.LOGIN_FAILED, fn); }

  reconnecting (fn) { this._eventEmitter.on(internal.RECONNECTING, fn); }

  reconnected (fn) { this._eventEmitter.on(internal.RECONNECTED, fn); }

  reconnectFailed (fn) { this._eventEmitter.on(internal.RECONNECT_FAILED, fn); }

  ready (fn) { this._eventEmitter.on(internal.READY, fn); }

  ping (fn) { this._eventEmitter.on(internal.PING, fn); }

  pong (fn) { this._eventEmitter.on(internal.PONG, fn); }

  groupAudioConfurationUpdated (fn) { this._eventEmitter.on(event.GROUP_AUDIO_CONFIGURATION_UPDATE, fn); }

  groupAudioCountUpdated (fn) { this._eventEmitter.on(event.GROUP_AUDIO_COUNT_UPDATE, fn); }

  joinedGroup (fn) { this._eventEmitter.on(internal.JOINED_GROUP, fn); }

  leftGroup (fn) { this._eventEmitter.on(internal.LEFT_GROUP, fn); }

  groupUpdated (fn) { this._eventEmitter.on(event.GROUP_UPDATE, fn); }

  subscriberJoined (fn) { this._eventEmitter.on(event.GROUP_MEMBER_ADD, fn); }

  subscriberLeft (fn) { this._eventEmitter.on(event.GROUP_MEMBER_DELETE, fn); }

  groupSubscriberUpdated (fn) { this._eventEmitter.on(event.GROUP_MEMBER_UPDATE, fn); }

  error (fn) { this._eventEmitter.on(internal.ERROR, fn); }

  log (fn) { this._eventEmitter.on(internal.LOG, fn); }

  packetReceived (fn) { this._eventEmitter.on(internal.PACKET_RECEIVED, fn); }

  packetSent (fn) { this._eventEmitter.on(internal.PACKET_SENT, fn); }

  subscriberUpdated (fn) { this._eventEmitter.on(event.SUBSCRIBER_UPDATE, fn); }

  presenceUpdate (fn) { this._eventEmitter.on(event.PRESENCE_UPDATE, fn); }

  privateMessageRequestAccepted (fn) { this._eventEmitter.on(internal.PRIVATE_MESSAGE_ACCEPT_RESPONSE, fn); }

  permissionFailed (fn) { this._eventEmitter.on(internal.PERMISSIONS_FAILED, fn); }

  messageReceived (fn) { this._eventEmitter.on(event.MESSAGE_SEND, fn); }

  messageUpdated (fn) { this._eventEmitter.on(event.MESSAGE_UPDATE, fn); }

  tipped (fn) { this._eventEmitter.on(event.TIP_ADD, fn); }

  contactAdded (fn) { this._eventEmitter.on(event.SUBSCRIBER_CONTACT_ADD, fn); }

  contactRemoved (fn) { this._eventEmitter.on(event.SUBSCRIBER_CONTACT_DELETE, fn); }

  subscriberBlocked (fn) { this._eventEmitter.on(event.SUBSCRIBER_BLOCK_ADD, fn); }

  subscriberUnblocked (fn) { this._eventEmitter.on(event.SUBSCRIBER_BLOCK_DELETE, fn); }

  _register () {
    for (const evt of Object.entries(event)) {
      try {
        if (fs.existsSync(path.join(__dirname, `/handlers/${evt[0]}.js`))) {
          const Event = require(`./handlers/${evt[0]}`);
          this._handlers[evt[1]] = new Event(this, evt[0].toLowerCase().replace('_', ' '));
          this._bot.on._emit(internal.LOG, `Registered Server Event: ${evt[0].toLowerCase().replace('_', ' ')}`);
        }
      } catch (error) {
        console.log(`Unable to register event: ${evt[0]}`, error);
      }
    }
  }

  _unregister () {
    this._handlers = {};
  }

  _emit (eventString, arg1, arg2) {
    this._eventEmitter.emit(eventString, arg1, arg2);
  }
};

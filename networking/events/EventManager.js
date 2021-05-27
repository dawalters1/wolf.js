/* eslint-disable accessor-pairs */
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

module.exports = class EventManager {
  constructor (bot) {
    this._bot = bot;
    this._eventEmitter = new EventEmitter();
    this._handlers = {};
    this._serverEvents = {
      GROUP_AUDIO_CONFIGURATION_UPDATE: 'group audio configuration update',
      GROUP_AUDIO_COUNT_UPDATE: 'group audio count update',
      GROUP_MEMBER_ADD: 'group member add',
      GROUP_MEMBER_DELETE: 'group member delete',
      GROUP_MEMBER_UPDATE: 'group member update',
      GROUP_UPDATE: 'group update',
      MESSAGE_SEND: 'message send',
      MESSAGE_UPDATE: 'message update',
      PRESENCE_UPDATE: 'presence update',
      SUBSCRIBER_BLOCK_ADD: 'subscriber block add',
      SUBSCRIBER_BLOCK_DELETE: 'subscriber block delete',
      SUBSCRIBER_CONTACT_ADD: 'subscriber contact add',
      SUBSCRIBER_CONTACT_DELETE: 'subscriber contact delete',
      SUBSCRIBER_UPDATE: 'subscriber update',
      TIP_ADD: 'tip add',
      WELCOME: 'welcome'
    };
    this._internalEvents = {

      READY: 'ready',
      PACKET_SENT: 'packet sent',
      PACKET_RECEIVED: 'packet received',
      LOGIN_SUCCESS: 'login success',
      LOGIN_FAILED: 'login failed',
      LOG: 'log',
      INTERNAL_ERROR: 'internal error',
      JOINED_GROUP: 'joined group',
      LEFT_GROUP: 'left group',
      PERMISSIONS_FAILED: 'permissions failed',
      PRIVATE_MESSAGE_ACCEPT_RESPONSE: 'private message accept response',
      COMMAND_MANAGER: 'command manager',
      RECONNECT_FAILED: 'reconnect failed',
      FORM_EXISTS: 'form exists',
      ERROR: 'internal error'
    };
    this._socketEvents = {
      CONNECTING: 'connecting',
      CONNECTED: 'connected',
      DISCONNECTED: 'disconnected',
      RECONNECTING: 'reconnecting',
      RECONNECTED: 'reconnected',
      CONNECTION_ERROR: 'connection error',
      PING: 'ping',
      PONG: 'pong'
    };
  }

  connecting (fn) { this._eventEmitter.on(this._socketEvents.CONNECTING, fn); };

  connected (fn) { this._eventEmitter.on(this._socketEvents.CONNECTED, fn); }

  connectionError (fn) { this._eventEmitter.on(this._socketEvents.CONNECTION_ERROR, fn); }

  disconnected (fn) { this._eventEmitter.on(this._socketEvents.DISCONNECTED, fn); }

  welcomed (fn) { this._eventEmitter.on(this._serverEvents.WELCOME, fn); }

  loginSuccess (fn) { this._eventEmitter.on(this._socketEvents.LOGIN_SUCCESS, fn); }

  loginFailed (fn) { this._eventEmitter.on(this._socketEvents.LOGIN_FAILED, fn); }

  reconnecting (fn) { this._eventEmitter.on(this._socketEvents.RECONNECTING, fn); }

  reconnected (fn) { this._eventEmitter.on(this._socketEvents.RECONNECT, fn); }

  reconnectFailed (fn) { this._eventEmitter.on(this._socketEvents.RECONNECT_FAILED, fn); }

  ready (fn) { this._eventEmitter.on(this._internalEvents.READY, fn); }

  ping (fn) { this._eventEmitter.on(this._internalEvents.PING, fn); }

  pong (fn) { this._eventEmitter.on(this._internalEvents.PONG, fn); }

  groupAudioConfurationUpdated (fn) { this._eventEmitter.on(this._serverEvents.GROUP_AUDIO_CONFIGURATION_UPDATE, fn); }

  groupAudioCountUpdated (fn) { this._eventEmitter.on(this._serverEvents.GROUP_AUDIO_COUNT_UPDATE, fn); }

  joinedGroup (fn) { this._eventEmitter.on(this._internalEvents.JOINED_GROUP, fn); }

  leftGroup (fn) { this._eventEmitter.on(this._internalEvents.LEFT_GROUP, fn); }

  groupUpdated (fn) { this._eventEmitter.on(this._serverEvents.GROUP_UPDATE, fn); }

  subscriberJoined (fn) { this._eventEmitter.on(this._serverEvents.GROUP_MEMBER_ADD, fn); }

  subscriberLeft (fn) { this._eventEmitter.on(this._serverEvents.GROUP_MEMBER_DELETE, fn); }

  groupSubscriberUpdated (fn) { this._eventEmitter.on(this._serverEvents.GROUP_MEMBER_UPDATE, fn); }

  error (fn) { this._eventEmitter.on(this._internalEvents.ERROR, fn); }

  log (fn) { this._eventEmitter.on(this._internalEvents.LOG, fn); }

  packetReceived (fn) { this._eventEmitter.on(this._internalEvents.PACKET_RECEIVED, fn); }

  packetSent (fn) { this._eventEmitter.on(this._internalEvents.PACKET_SENT, fn); }

  subscriberUpdated (fn) { this._eventEmitter.on(this._serverEvents.SUBSCRIBER_UPDATE, fn); }

  presenceUpdate (fn) { this._eventEmitter.on(this._serverEvents.PRESENCE_UPDATE, fn); }

  privateMessageRequestAccepted (fn) { this._eventEmitter.on(this._internalEvents.PRIVATE_MESSAGE_ACCEPT_RESPONSE, fn); }

  permissionFailed (fn) { this._eventEmitter.on(this._internalEvents.PERMISSIONS_FAILED, fn); }

  messageReceived (fn) { this._eventEmitter.on(this._serverEvents.MESSAGE_SEND, fn); }

  messageUpdated (fn) { this._eventEmitter.on(this._serverEvents.MESSAGE_UPDATE, fn); }

  tipped (fn) { this._eventEmitter.on(this._serverEvents.TIP_ADD, fn); }

  contactAdded (fn) { this._eventEmitter.on(this._serverEvents.SUBSCRIBER_CONTACT_ADD, fn); }

  contactRemoved (fn) { this._eventEmitter.on(this._serverEvents.SUBSCRIBER_CONTACT_DELETE, fn); }

  subscriberBlocked (fn) { this._eventEmitter.on(this._serverEvents.SUBSCRIBER_BLOCK_ADD, fn); }

  subscriberUnblocked (fn) { this._eventEmitter.on(this._serverEvents.SUBSCRIBER_BLOCK_DELETE, fn); }

  _register () {
    for (const event of Object.entries(this._serverEvents)) {
      try {
        if (fs.existsSync(path.join(__dirname, `/handlers/${event[0]}.js`))) {
          const Event = require(`./handlers/${event[0]}`);
          this._handlers[event[1]] = new Event(this, event[0].toLowerCase().replace('_', ' '));
          this._bot.on._emit(this._internalEvents.LOG, `Registered Server Event: ${event[0].toLowerCase().replace('_', ' ')}`);
        }
      } catch (error) {
        console.log(`Unable to register event: ${event[0]}`, error);
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

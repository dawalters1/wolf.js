/* eslint-disable accessor-pairs */
const EventEmitter = require('events');

const event = require('../../../constants/event');
const internal = require('../../../constants/internal');

/**
 * {@hideconstructor}
 */
module.exports = class EventManager {
  constructor (api) {
    this._api = api;
    this._eventEmitter = new EventEmitter();
  }

  // #region API/Connection WS Events

  connected (fn) { this._eventEmitter.on(internal.CONNECTED, fn); }
  connecting (fn) { this._eventEmitter.on(internal.CONNECTING, fn); };
  connectionError (fn) { this._eventEmitter.on(internal.CONNECTION_ERROR, fn); }
  disconnected (fn) { this._eventEmitter.on(internal.DISCONNECTED, fn); }
  error (fn) { this._eventEmitter.on(internal.ERROR, fn); }
  log (fn) { this._eventEmitter.on(internal.LOG, fn); }
  loginFailed (fn) { this._eventEmitter.on(internal.LOGIN_FAILED, fn); }
  loginSuccess (fn) { this._eventEmitter.on(internal.LOGIN_SUCCESS, fn); }
  packetReceived (fn) { this._eventEmitter.on(internal.PACKET_RECEIVED, fn); }
  packetSent (fn) { this._eventEmitter.on(internal.PACKET_SENT, fn); }
  ping (fn) { this._eventEmitter.on(internal.PING, fn); }
  pong (fn) { this._eventEmitter.on(internal.PONG, fn); }
  ready (fn) { this._eventEmitter.on(internal.READY, fn); }
  reconnectFailed (fn) { this._eventEmitter.on(internal.RECONNECT_FAILED, fn); }
  reconnected (fn) { this._eventEmitter.on(internal.RECONNECTED, fn); }
  reconnecting (fn) { this._eventEmitter.on(internal.RECONNECTING, fn); }
  welcomed (fn) { this._eventEmitter.on(event.WELCOME, fn); }

  // #endregion

  // #region  Subscriber Events

  contactAdded (fn) { this._eventEmitter.on(event.SUBSCRIBER_CONTACT_ADD, fn); }
  contactRemoved (fn) { this._eventEmitter.on(event.SUBSCRIBER_CONTACT_DELETE, fn); }
  presenceUpdate (fn) { this._eventEmitter.on(event.PRESENCE_UPDATE, fn); }
  privateMessageRequestAccepted (fn) { this._eventEmitter.on(internal.PRIVATE_MESSAGE_ACCEPT_RESPONSE, fn); }
  subscriberBlocked (fn) { this._eventEmitter.on(event.SUBSCRIBER_BLOCK_ADD, fn); }
  subscriberGroupEventAdded (fn) { this._eventEmitter.on(event.SUBSCRIBER_GROUP_EVENT_ADD, fn); }
  subscriberGroupEventDeleted (fn) { this._eventEmitter.on(event.SUBSCRIBER_GROUP_EVENT_DELETE, fn); }
  subscriberUnblocked (fn) { this._eventEmitter.on(event.SUBSCRIBER_BLOCK_DELETE, fn); }
  subscriberUpdate (fn) { this._eventEmitter.on(event.SUBSCRIBER_UPDATE, fn); }

  // #endregion

  // #region  Group Events

  groupAudioCountUpdate (fn) { this._eventEmitter.on(event.GROUP_AUDIO_COUNT_UPDATE, fn); }
  groupAudioSlotUpdate (fn) { this._eventEmitter.on(event.GROUP_AUDIO_SLOT_UPDATE, fn); }
  groupAudioUpdate (fn) { this._eventEmitter.on(event.GROUP_AUDIO_UPDATE, fn); }
  groupEventCreated (fn) { this._eventEmitter.on(event.GROUP_EVENT_CREATE, fn); }
  groupEventUpdate (fn) { this._eventEmitter.on(event.GROUP_EVENT_UPDATE, fn); };
  groupEventUpdated (fn) {
    console.warn('groupEventUpdated is deprecated, use groupEventUpdate instead');
    this._eventEmitter.on(event.GROUP_EVENT_UPDATE, fn);
  }

  groupSubscriberUpdate (fn) { this._eventEmitter.on(event.GROUP_MEMBER_UPDATE, fn); }
  groupUpdate (fn) { this._eventEmitter.on(event.GROUP_UPDATE, fn); }
  groupUpdated (fn) {
    console.warn('groupUpdated is deprecated, use groupUpdate instead');
    this._eventEmitter.on(event.GROUP_UPDATE, fn);
  }

  joinedGroup (fn) { this._eventEmitter.on(internal.JOINED_GROUP, fn); }
  leftGroup (fn) { this._eventEmitter.on(internal.LEFT_GROUP, fn); }
  subscriberJoined (fn) { this._eventEmitter.on(event.GROUP_MEMBER_ADD, fn); }
  subscriberLeft (fn) { this._eventEmitter.on(event.GROUP_MEMBER_DELETE, fn); }

  // #endregion

  // #region  Message Events

  groupMessage (fn) { this._eventEmitter.on(internal.GROUP_MESSAGE, fn); }
  privateMessage (fn) { this._eventEmitter.on(internal.PRIVATE_MESSAGE, fn); }

  messageUpdate (fn) { this._eventEmitter.on(event.MESSAGE_UPDATE, fn); }
  messageUpdated (fn) {
    console.warn('messageUpdated is deprecated, use messageUpdate instead');
    this._eventEmitter.on(event.MESSAGE_UPDATE, fn);
  }

  tipped (fn) { this._eventEmitter.on(event.TIP_ADD, fn); }

  // #endregion

  // #region  Stage Client Events

  stageClientBroadcastEnded (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_BROADCAST_ENDED, fn); }
  stageClientConnecting (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_CONNECTING, fn); }
  stageClientConnected (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_CONNECTED, fn); }
  stageClientDisconnected (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_DISCONNECTED, fn); }
  stageClientDurationUpdate (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_DURATION_UPDATE, fn); }
  stageClientError (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_ERROR, fn); }
  stageClientKicked (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_KICKED, fn); }
  stageClientMuted (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_MUTED, fn); }
  stageClientPaused (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_PAUSED, fn); }
  stageClientReady (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_READY, fn); }
  stageClientStopped (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_STOPPED, fn); }
  stageClientUnmuted (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_UNMUTED, fn); }
  stageClientUnpaused (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_UNPAUSED, fn); }
  stageClientViewerCountUpdate (fn) { this._eventEmitter.on(internal.STAGE_CLIENT_VIEWER_COUNT_CHANGED, fn); }

  // #endregion

  // #region  Command Events

  permissionFailed (fn) { this._eventEmitter.on(internal.PERMISSIONS_FAILED, fn); }

  // #endregion

  // #region  Notifications

  notification (fn) { this._eventEmitter.on(internal.NOTIFICATION_RECEIVED, fn); }

  _emit (eventString, arg1, arg2) {
    this._eventEmitter.emit(eventString, arg1, arg2);
  }
};

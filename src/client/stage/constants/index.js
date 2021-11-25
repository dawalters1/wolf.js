exports.connectionState = {
  UNINITIALIZED: 'uninitialized',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  READY: 'ready'
};

exports.broadcastState = {
  NOT_BROADCASTING: 'not broadcasting',
  BROADCASTING: 'broadcasting',
  PAUSED: 'paused'
};

exports.events = {
  CONNECTING: 'stageClientConnecting',
  CONNECTED: 'stageClientConnect',
  DISCONNECTED: 'stageClientDisconnected',
  KICKED: 'stageClientKicked',
  READY: 'stageClientReady',

  BROADCAST_END: 'stageClientBroadcastEnd',
  BROADCAST_PAUSED: 'stageClientBroadcastPaused',
  BROADCAST_START: 'stageClientBroadcastStart',
  BROADCAST_RESUME: 'stageClientBroadcastResume',
  BROADCAST_ERROR: 'stageClientBroadcastError',
  BROADCAST_MUTED: 'stageClientBroadcastMuted',
  BROADCAST_UNMUTED: 'stageClientBroadcastUnmuted',
  BROADCAST_STOPPED: 'stageClientBroadcastStopped',
  BROADCAST_DURATION: 'stageClientBroadcastDuration'
};

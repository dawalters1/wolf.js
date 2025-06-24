/**
 * @private
 */
exports.ServerEvents = {
  GROUP_AUDIO_COUNT_UPDATE: 'group audio count update',
  GROUP_AUDIO_REQUEST_ADD: 'group audio request add',
  GROUP_AUDIO_REQUEST_CLEAR: 'group audio request clear',
  GROUP_AUDIO_REQUEST_DELETE: 'group audio request delete',
  GROUP_AUDIO_SLOT_UPDATE: 'group audio slot update',
  GROUP_AUDIO_UPDATE: 'group audio update',
  GROUP_EVENT_CREATE: 'group event create',
  GROUP_EVENT_UPDATE: 'group event update',
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
  SUBSCRIBER_GROUP_EVENT_ADD: 'subscriber group event add',
  SUBSCRIBER_GROUP_EVENT_DELETE: 'subscriber group event delete',

  SUBSCRIBER_UPDATE: 'subscriber update',

  TIP_ADD: 'tip add',

  OBJECTION: 'objection',

  WELCOME: 'welcome'
};

/**
 * @private
 */
exports.Events = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  CONNECTION_ERROR: 'connectError',
  CONNECTION_TIMEOUT: 'connectTimeout',

  DISCONNECTED: 'disconnected',

  ERROR: 'error',

  GROUP_AUDIO_COUNT_UPDATE: 'groupAudioCountUpdate',
  GROUP_AUDIO_REQUEST_ADD: 'groupAudioRequestAdd',
  GROUP_AUDIO_REQUEST_CLEAR: 'groupAudioRequestListClear',
  GROUP_AUDIO_REQUEST_DELETE: 'groupAudioRequestDelete',
  GROUP_AUDIO_REQUEST_EXPIRE: 'groupAudioRequestExpire',
  GROUP_AUDIO_SLOT_UPDATE: 'groupAudioSlotUpdate',
  GROUP_AUDIO_UPDATE: 'groupAudioUpdate',
  GROUP_EVENT_CREATE: 'groupEventCreate',
  GROUP_EVENT_DELETE: 'groupEventDelete',
  GROUP_EVENT_UPDATE: 'groupEventUpdate',
  GROUP_MEMBER_ADD: 'groupMemberAdd',
  GROUP_MEMBER_DELETE: 'groupMemberDelete',
  GROUP_MEMBER_UPDATE: 'groupMemberUpdate',
  GROUP_MESSAGE: 'groupMessage',
  GROUP_MESSAGE_UPDATE: 'groupMessageUpdate',
  GROUP_TIP_ADD: 'groupTipAdd',
  GROUP_UPDATE: 'groupUpdate',

  INTERNAL_ERROR: 'internalError',

  JOINED_GROUP: 'joinedGroup',

  LEFT_GROUP: 'leftGroup',

  LOG: 'log',

  LOGIN_FAILED: 'loginFailed',
  LOGIN_SUCCESS: 'loginSuccess',

  NOTIFICATION_RECEIVED: 'notificationReceived',

  PACKET_RECEIVED: 'packetReceived',
  PACKET_SENT: 'packetSent',
  PACKET_FAILED: 'packetFailed',
  PACKET_RETRY: 'packetRetry',

  PING: 'ping',
  PONG: 'pong',

  PRESENCE_UPDATE: 'presenceUpdate',

  PRIVATE_MESSAGE: 'privateMessage',
  PRIVATE_MESSAGE_ACCEPT_RESPONSE: 'privateMessageAcceptResponse',
  PRIVATE_MESSAGE_UPDATE: 'privateMessageUpdate',
  PRIVATE_TIP_ADD: 'privateTipAdd',

  READY: 'ready',
  RESUME: 'resume',

  RECONNECTED: 'reconnected',
  RECONNECTING: 'reconnecting',
  RECONNECT_FAILED: 'reconnectFailed',

  STAGE_CLIENT_BROADCAST_END: 'stageClientBroadcastEnd',
  STAGE_CLIENT_CONNECTED: 'stageClientConnected',
  STAGE_CLIENT_CONNECTING: 'stageClientConnecting',
  STAGE_CLIENT_DISCONNECTED: 'stageClientDisconnected',
  STAGE_CLIENT_DURATION_UPDATE: 'stageClientBroadcastDuration',
  STAGE_CLIENT_ERROR: 'stageClientBroadcastError',
  STAGE_CLIENT_KICKED: 'stageClientKicked',
  STAGE_CLIENT_MUTED: 'stageClientBroadcastMuted',
  STAGE_CLIENT_PAUSED: 'stageClientBroadcastPaused',
  STAGE_CLIENT_READY: 'stageClientReady',
  STAGE_CLIENT_STOPPED: 'stageClientBroadcastStopped',
  STAGE_CLIENT_UNMUTED: 'stageClientBroadcastUnmuted',
  STAGE_CLIENT_UNPAUSED: 'stageClientBroadcastUnpaused',
  STAGE_CLIENT_VIEWER_COUNT_CHANGED: 'stageClientBroadcastViewerCountChanged',

  SUBSCRIBER_BLOCK_ADD: 'subscriberBlockAdd',
  SUBSCRIBER_BLOCK_DELETE: 'subscriberBlockDelete',
  SUBSCRIBER_CONTACT_ADD: 'subscriberContactAdd',
  SUBSCRIBER_CONTACT_DELETE: 'subscriberContactDelete',
  SUBSCRIBER_GROUP_EVENT_ADD: 'subscriberGroupEventAdd',
  SUBSCRIBER_GROUP_EVENT_DELETE: 'subscriberGroupEventDelete',
  SUBSCRIBER_UPDATE: 'subscriberUpdate',

  WELCOME: 'welcome'
};

/**
 * @private
 */

exports.MessageTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

/**
 * @private
 */
exports.Commands = {
  ACHIEVEMENT: 'achievement',
  ACHIEVEMENT_CATEGORY_LIST: 'achievement category list',
  ACHIEVEMENT_GROUP_LIST: 'achievement group list',
  ACHIEVEMENT_SUBSCRIBER_LIST: 'achievement subscriber list',

  CHARM_LIST: 'charm list',
  CHARM_SUBSCRIBER_ACTIVE_LIST: 'charm subscriber active list',
  CHARM_SUBSCRIBER_DELETE: 'charm subscriber delete',
  CHARM_SUBSCRIBER_EXPIRED_LIST: 'charm subscriber expired list',
  CHARM_SUBSCRIBER_SET_SELECTED: 'charm subscriber set selected',
  CHARM_SUBSCRIBER_STATISTICS: 'charm subscriber statistics',
  CHARM_SUBSCRIBER_SUMMARY_LIST: 'charm subscriber summary list',

  GROUP_AUDIO_BROADCAST: 'group audio broadcast',
  GROUP_AUDIO_BROADCAST_DISCONNECT: 'group audio broadcast disconnect',
  GROUP_AUDIO_BROADCAST_UPDATE: 'group audio broadcast update',
  GROUP_AUDIO_CONSUME: 'group audio consume',
  GROUP_AUDIO_REQUEST_ADD: 'group audio request add',
  GROUP_AUDIO_REQUEST_CLEAR: 'group audio request clear',
  GROUP_AUDIO_REQUEST_DELETE: 'group audio request delete',
  GROUP_AUDIO_REQUEST_LIST: 'group audio request list',
  GROUP_AUDIO_SLOT_LIST: 'group audio slot list',
  GROUP_AUDIO_SLOT_UPDATE: 'group audio slot update',
  GROUP_AUDIO_UPDATE: 'group audio update',
  GROUP_CREATE: 'group create',
  GROUP_EVENT: 'group event',
  GROUP_EVENT_CREATE: 'group event create',
  GROUP_EVENT_DELETE: 'group event delete',
  GROUP_EVENT_LIST: 'group event list',
  GROUP_EVENT_UPDATE: 'group event update',
  GROUP_MEMBER: 'group member',
  GROUP_MEMBER_ADD: 'group member add',
  GROUP_MEMBER_DELETE: 'group member delete',
  GROUP_MEMBER_LIST: 'group member list',
  GROUP_MEMBER_UPDATE: 'group member update',
  GROUP_PROFILE: 'group profile',
  GROUP_PROFILE_UPDATE: 'group profile update',
  GROUP_RECOMMENDATION_LIST: 'group recommendation list',
  GROUP_STATS: 'group stats',

  MESSAGE_CONVERSATION_LIST: 'message conversation list',
  MESSAGE_GROUP_HISTORY_LIST: 'message group history list',
  MESSAGE_GROUP_SUBSCRIBE: 'message group subscribe',
  MESSAGE_GROUP_UNSUBSCRIBE: 'message group unsubscribe',
  MESSAGE_PRIVATE_HISTORY_LIST: 'message private history list',
  MESSAGE_PRIVATE_SUBSCRIBE: 'message private subscribe',
  MESSAGE_PRIVATE_UNSUBSCRIBE: 'message private unsubscribe',
  MESSAGE_SEND: 'message send',
  MESSAGE_SETTING: 'message setting',
  MESSAGE_SETTING_UPDATE: 'message setting update',
  MESSAGE_UPDATE: 'message update',
  MESSAGE_UPDATE_LIST: 'message update list',

  METADATA_URL: 'metadata url',
  METADATA_URL_BLACKLIST: 'metadata url blacklist',

  NOTIFICATION_LIST: 'notification list',
  NOTIFICATION_LIST_CLEAR: 'notification list clear',

  SEARCH: 'search',

  SECURITY_LOGIN: 'security login',
  SECURITY_LOGOUT: 'security logout',
  SECURITY_TOKEN_REFRESH: 'security token refresh',

  STAGE_GROUP_ACTIVE_LIST: 'stage group active list',
  STAGE_LIST: 'stage list',

  STORE_CREDIT_BALANCE: 'store credit balance',
  STORE_PRODUCT: 'store product',
  STORE_PRODUCT_PROFILE: 'store product profile',
  STORE_PRODUCT_CREDIT_LIST: 'store product credit list',

  SUBSCRIBER_BLOCK_ADD: 'subscriber block add',
  SUBSCRIBER_BLOCK_DELETE: 'subscriber block delete',
  SUBSCRIBER_BLOCK_LIST: 'subscriber block list',
  SUBSCRIBER_CONTACT_ADD: 'subscriber contact add',
  SUBSCRIBER_CONTACT_DELETE: 'subscriber contact delete',
  SUBSCRIBER_CONTACT_LIST: 'subscriber contact list',
  SUBSCRIBER_GROUP_EVENT_ADD: 'subscriber group event add',
  SUBSCRIBER_GROUP_EVENT_DELETE: 'subscriber group event delete',
  SUBSCRIBER_GROUP_EVENT_LIST: 'subscriber group event list',
  SUBSCRIBER_GROUP_LIST: 'subscriber group list',
  SUBSCRIBER_PRESENCE: 'subscriber presence',
  SUBSCRIBER_PROFILE: 'subscriber profile',
  SUBSCRIBER_PROFILE_UPDATE: 'subscriber profile update',
  SUBSCRIBER_SETTINGS_UPDATE: 'subscriber settings update',

  TIP_ADD: 'tip add',
  TIP_DETAIL: 'tip detail',
  TIP_GROUP_SUBSCRIBE: 'tip group subscribe',
  TIP_LEADERBOARD_GLOBAL: 'tip leaderboard global',
  TIP_LEADERBOARD_GLOBAL_SUMMARY: 'tip leaderboard global summary',
  TIP_LEADERBOARD_GROUP: 'tip leaderboard group',
  TIP_LEADERBOARD_GROUP_SUMMARY: 'tip leaderboard group summary',
  TIP_PRIVATE_SUBSCRIBE: 'tip private subscribe',
  TIP_SUMMARY: 'tip summary',

  TOPIC_PAGE_LAYOUT: 'topic page layout',
  TOPIC_PAGE_RECIPE_LIST: 'topic page recipe list',

  WOLFSTAR_PROFILE: 'wolfstar profile'
};

exports.AdminAction = {
  REGULAR: 0,
  ADMIN: 1,
  MOD: 2,
  BAN: 4,
  SILENCE: 8,
  KICK: 16,
  JOIN: 17,
  LEAVE: 18,
  OWNER: 32,
  COOWNER: 64
};

exports.Capability = {
  NOT_MEMBER: -1,
  REGULAR: 0,
  ADMIN: 1,
  MOD: 2,
  BANNED: 4,
  SILENCED: 8,
  OWNER: 32,
  COOWNER: 64
};

exports.Category = {
  NOT_SPECIFIED: 0,
  BUSINESS: 8,
  EDUCATION: 10,
  ENTERTAINMENT: 26,
  GAMING: 12,
  LIFESTYLE: 13,
  MUSIC: 14,
  NEWS_AND_POLITICS: 15,
  PHOTOGRAPHY: 16,
  SCIENCE_AND_TECH: 25,
  SOCIAL_AND_PEOPLE: 17,
  SPORTS: 19,
  TRAVEL_AND_LOCAL: 18
};

exports.ContextType = {
  MESSAGE: 'message',
  STAGE: 'stage'
};

exports.MessageLinkingType = {
  EXTERNAL: 'external',

  GROUP_CHAT: 'groupChat', // wolf://group/{groupid}
  GROUP_PROFILE: 'groupProfile', // wolf://group/{groupId}/profile,

  SUBSCRIBER_CHAT: 'subscriberChat', // wolf://user/{subscriberId}
  SUBSCRIBER_PROFILE: 'subscriberProfile' // wolf://user/{subscriberId}/profile
};

exports.DeviceType = {
  OTHER: 0,
  BOT: 1,
  IPHONE: 5,
  IPAD: 6,
  ANDROID: 7,
  WEB: 8
};

exports.EmbedType = {
  GROUP_PREVIEW: 'groupPreview',

  IMAGE_PREVIEW: 'imagePreview',

  LINK_PREVIEW: 'linkPreview'
};

exports.Gender = {
  NOT_SPECIFIED: 0,
  MALE: 1,
  FEMALE: 2
};

exports.Language = {
  NOT_SPECIFIED: 0,
  ENGLISH: 1,
  GERMAN: 3,
  SPANISH: 4,
  FRENCH: 6,
  POLISH: 10,
  CHINESE_SIMPLIFIED: 11,
  RUSSIAN: 12,
  ITALIAN: 13,
  ARABIC: 14,
  PERSIAN_FARSI: 15,
  GREEK: 16,
  PORTUGUESE: 17,
  HINDI: 18,
  JAPANESE: 19,
  LATIN_SPANISH: 20,
  SLOVAK: 21,
  CZECH: 22,
  DANISH: 24,
  FINNISH: 25,
  HUNGARIAN: 27,
  BAHASA_INDONESIA: 28,
  MALAY: 29,
  DUTCH: 30,
  NORWEGIAN: 31,
  SWEDISH: 32,
  THAI: 33,
  TURKISH: 34,
  VIETNAMESE: 35,
  KOREAN: 36,
  BRAZILIAN_PORTUGUESE: 37,
  ESTONIAN: 39,
  KAZAKH: 41,
  LATVIAN: 42,
  LITHUANIAN: 43,
  UKRAINIAN: 44,
  BULGARIAN: 45
};

exports.LoginDevice = {
  ANDROID: 'android',
  IPAD: 'ipad',
  IPHONE: 'iphone',
  WEB: 'web'
};

exports.LoginType = {
  APPLE: 'apple',
  EMAIL: 'email',
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  SNAPCHAT: 'snapchat',
  TWITTER: 'twitter'
};

exports.LookingFor = {
  NOT_SPECIFIED: 0,
  FRIENDSHIP: 1,
  DATING: 2,
  RELATIONSHIP: 4,
  NETWORKING: 8
};

exports.MessageFilterTier = {
  OFF: 0,
  RELAXED: 3,
  RECOMMENDED: 2,
  STRICT: 1
};

exports.MessageType = {
  APPLICATION_PALRINGO_GROUP_ACTION: 'application/palringo-group-action',
  APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK: 'application/palringo-interactive-message-pack',

  AUDIO_AAC: 'audio/aac',
  AUDIO_SPEEX: 'audio/x-speex',

  IMAGE_GIF: 'image/gif',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_JPEGHTML: 'image/jpeghtml',

  TEXT_HTML: 'text/html',
  TEXT_IMAGE: 'text/image_link',
  TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE: 'text/palringo-private-request-response',
  TEXT_PLAIN: 'text/plain',
  TEXT_VOICE: 'text/voice_link'
};

exports.OnlineState = {
  OFFLINE: 0,
  ONLINE: 1,
  AWAY: 2,
  INVISIBLE: 3,
  BUSY: 5,
  IDLE: 9
};

exports.Privilege = {
  SUBSCRIBER: 1,
  BOT_TESTER: 1 << 1,
  GAME_TESTER: 1 << 2,
  CONTENT_SUBMITER: 1 << 3,
  SELECTCLUB_1: 1 << 4,
  ELITECLUB_1: 1 << 6,
  RANK_1: 1 << 7,
  VOLUNTEER: 1 << 9,
  SELECTCLUB_2: 1 << 10,
  ALPHA_TESTER: 1 << 11,
  STAFF: 1 << 12,
  TRANSLATOR: 1 << 13,
  DEVELOPER: 1 << 14,
  ELITECLUB_2: 1 << 17,
  PEST: 1 << 18,
  VALID_EMAIL: 1 << 19,
  PREMIUM_ACCOUNT: 1 << 20,
  VIP: 1 << 21,
  WOLF_STAR: 1 << 21,
  ELITECLUB_3: 1 << 22,
  WOLF_STAR_PRO: 1 << 23,
  USER_ADMIN: 1 << 24,
  GROUP_ADMIN: 1 << 25,
  BOT: 1 << 26,
  ENTERTAINER: 1 << 29,
  SHADOW_BANNED: 1 << 30
};

exports.Relationship = {
  NOT_SPECIFIED: 0,
  SINGLE: 1,
  RELATIONSHIP: 2,
  ENGAGED: 3,
  MARRIED: 4,
  COMPLICATED: 5,
  OPEN: 6
};

exports.SearchType = {
  GROUP: 'group',
  SUBSCRIBER: 'subscriber'
};

exports.TipDirection = {
  SENT: 'sent',
  RECEIVED: 'received'
};

exports.TipPeriod = {
  ALL_TIME: 'alltime',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
};

exports.TipType = {
  CHARM: 'charm',
  SUBSCRIBER: 'subscriber',
  GROUP: 'group'
};

exports.TopicPageRecipeType = {
  EVENT: 'event',
  GROUP: 'group',
  PRODUCT: 'product'
};

exports.WolfstarTalent = {
  MUSIC: 1,
  ENTERTAINMENT: 2,
  TALK_SHOW: 3,
  STORY_TELLING: 4,
  VOICE_OVER: 5,
  POETRY: 6,
  COMEDY: 7,
  IMITATING_VOICES: 8
};

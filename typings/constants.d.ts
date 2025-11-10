
export enum AdminAction {
  /**
   * User has no power in the channel
   */
  REGULAR = 0,
  /**
   * User has admin capabilities
   */
  ADMIN = 1,
  /**
   * User has mod capabilities
   */
  MOD = 2,
  /**
   * User is banned in the channel
   */
  BAN = 4,
  /**
   * User is silenced
   */
  SILENCE = 8,
  /**
   * User will be removed from the channel
   */
  KICK = 16,
  /**
   * User joined the channel
   */
  JOIN = 17,
  /**
   * User left the channel
   */
  LEAVE = 18,
  /**
   * User has owner capabilities
   */
  OWNER = 32,
  /**
   * User has co-owner capabilities
   */
  COOWNER = 64
}

export enum Avatar {
  GIF = 'gif',
  JPG = 'jpg',
  JPEG = 'jpeg',
  M4A = 'm4a',
  MP4 = 'mp4'
}

export enum AvatarType {
  USER = 'user',
  CHANNEL = 'channel'
}

export enum ChannelAudioSlotConnectionState {
  /**
   * Client is pending connection
   */
  PENDING = 'PENDING',
  /**
   * Client is connected
   */
  CONNECTED = 'CONNECTED',
  /**
   * Client was disconnected
   */
  DISCONNECTED = 'DISCONNECTED'
}

export enum ChannelEventType {
  NONE = 0,
  CHALLENGES = 1,
  MUSIC_SHOW = 2,
  POETRY = 3,
  TALK_SHOW = 4,
  WOLFSTAR_EVENT = 5,
  WOLF_EVENT = 6,
  COMEDY = 7,
  SCIENCE_HEALTH = 8,
  OTHER = 9
}

export enum ChannelHub {
  NONE = 'none',
  GAMING = 'gaming'
}

export enum ChannelMemberCapability {
  /**
   * User is not a member
   */
  NONE = -1,
  /**
   * User is a regular member
   */
  REGULAR = 0,
  /**
   * User is an admin
   */
  ADMIN = 1,
  /**
   * User is a mod
   */
  MOD = 2,
  /**
   * User is banned
   */
  BANNED = 4,
  /**
   * User is silenced
   */
  SILENCED = 8,
  /**
   * User is owner
   */
  OWNER = 32,
  /**
   * User is co-owner
   */
  CO_OWNER = 64
}

export enum ChannelMemberListType {
  PRIVILEGED = 'privileged',
  REGULAR = 'regular',
  SILENCED = 'silenced',
  BOTS = 'bots',
  BANNED = 'banned'
}

export enum ChannelVerificationTier {
  NONE = 'none',
  PREMIUM = 'premium',
  VERIFIED = 'verified'
}

export enum ContextType {
  MESSAGE = 'message',
  STAGE = 'stage'
}

export enum DeviceType {
  OTHER = 0,
  BOT = 1,
  IPHONE = 5,
  IPAD = 6,
  ANDROID = 7,
  WEB = 8,
  VR = 11
}

export enum EmbedType {
  CHANNEL_PREVIEW = 'groupPreview',
  IMAGE_PREVIEW = 'imagePreview',
  LINK_PREVIEW = 'linkPreview'
}

export enum Gender {
  NOT_SPECIFIED = 0,
  MALE = 1,
  FEMALE = 2
}

export enum IconSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
}

export enum Language {
  NOT_SPECIFIED = 0,
  ENGLISH = 1,
  GERMAN = 3,
  SPANISH = 4,
  FRENCH = 6,
  POLISH = 10,
  CHINESE_SIMPLIFIED = 11,
  RUSSIAN = 12,
  ITALIAN = 13,
  ARABIC = 14,
  PERSIAN_FARSI = 15,
  GREEK = 16,
  PORTUGUESE = 17,
  HINDI = 18,
  JAPANESE = 19,
  LATIN_SPANISH = 20,
  SLOVAK = 21,
  CZECH = 22,
  DANISH = 24,
  FINNISH = 25,
  HUNGARIAN = 27,
  BAHASA_INDONESIA = 28,
  MALAY = 29,
  DUTCH = 30,
  NORWEGIAN = 31,
  SWEDISH = 32,
  THAI = 33,
  TURKISH = 34,
  VIETNAMESE = 35,
  KOREAN = 36,
  BRAZILIAN_PORTUGUESE = 37,
  ESTONIAN = 39,
  KAZAKH = 41,
  LATVIAN = 42,
  LITHUANIAN = 43,
  UKRAINIAN = 44,
  BULGARIAN = 45
}
export enum LoginType {
  APPLE = 'apple',
  EMAIL = 'email',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  SNAPCHAT = 'snapchat',
  TWITTER = 'twitter'
}

export enum LookingFor {
  NOT_SPECIFIED = 0,
  FRIENDSHIP = 1,
  DATING = 2,
  RELATIONSHIP = 4,
  NETWORKING = 8
}

export enum MessageFilterTierLevel {
  OFF = 0,
  RELAXED = 3,
  RECOMMENDED = 2,
  STRICT = 1
}

export enum MessageType {
  TEXT_PLAIN = 'text/plain',
  TEXT_IMAGE = 'text/image_link',
  TEXT_VOICE = 'text/voice_link',
  TEXT_HTML = 'text/html',
  AUDIO_SPEEX = 'audio/x-speex',
  IMAGE_JPEGHTML = 'image/jpeghtml',
  PM_REQUEST_RESPONSE = 'application/palringo-private-request-response',
  GROUP_ACTION = 'application/palringo-group-action',
  INTERACTIVE_MESSAGE_PACK = 'application/palringo-interactive-message-pack'
}

export enum Relationship {
  NOT_SPECIFIED = 0,
  SINGLE = 1,
  RELATIONSHIP = 2,
  ENGAGED = 3,
  MARRIED = 4,
  COMPLICATED = 5,
  OPEN = 6
}

export enum Search {
  CHANNEL = 'group',
  USER = 'subscriber'
}

export enum TipDirection {
  SENT = 'sent',
  RECEIVED = 'received'
}

export enum TipPeriod {
  ALL_TIME = 'alltime',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export enum TipType {
  CHARM = 'charm',
  USER = 'subscriber',
  CHANNEL = 'group'
}

export enum TopicPageRecipeType {
  CHANNEL = 'group',
  EVENT = 'groupEvent',
  LIVE_EVENT = 'liveGroupEvent',
  PRODUCT = 'product',
  USER = 'user'
}

export enum UserFollowerType {
  FOLLOWING = 'following',
  FOLLOWER = 'follower'
}

export enum OnlineState {
  /**
   * User is offline
   */
  OFFLINE = 0,
  /**
   * User is online
   */
  ONLINE = 1,
  /**
   * User is away
   */
  AWAY = 2,
  /**
   * User is away
   */
  BUSY = 5,
  /**
   * User is idle
   */
  IDLE = 9
}

export enum UserPrivilege {
  SUBSCRIBER = 1,
  BOT_TESTER = 2,
  CONTENT_SUBMITER = 8,
  SELECT_CLUB_1 = 16,
  ADMIN_AREA = 32,
  ELITE_CLUB_1 = 64,
  NUMBER_ONE_USER = 128,
  WELCOME_HOST = 256,
  VOLUNTEER = 512,
  SELECT_CLUB_2 = 1024,
  ALPHA_TESTER = 2048,
  STAFF = 4096,
  DEVELOPER = 16384,
  PRIVILEGE_ADMIN = 32768,
  CHARM_ACTIVE = 65536,
  ELITE_CLUB_2 = 131072,
  CONTENT_CREATOR = 262144,
  VALID_EMAIL = 524288,
  PREMIUM_ACCOUNT = 1048576,
  WOLFSTAR = 2097152,
  ELITE_CLUB_3 = 4194304,
  WOLFSTAR_PRO = 8388608,
  USER_ADMIN = 16777216,
  GROUP_ADMIN = 33554432,
  BOT = 67108864,
  APPLE_REVIEWER = 134217728,
  PCS = 268435456
}

export enum WOLFStarTalent {
  MUSIC = 1,
  ENTERTAINMENT = 2,
  TALK_SHOW = 3,
  STORY_TELLING = 4,
  VOICE_OVER = 5,
  POETRY = 6,
  COMEDY = 7,
  IMITATING_VOICES = 8
}

export type {
  AdminAction,
  Avatar,
  AvatarType,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
  ChannelHub,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelVerificationTier,
  ContextType,
  DeviceType,
  EmbedType,
  Gender,
  IconSize,
  Language,
  LoginType,
  LookingFor,
  MessageFilterTierLevel,
  MessageType,
  Relationship,
  Search,
  TipDirection,
  TipPeriod,
  TipType,
  TopicPageRecipeType,
  UserFollowerType,
  OnlineState,
  UserPrivilege,
  WOLFStarTalent
};
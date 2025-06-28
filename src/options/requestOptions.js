
// Shared constants
export const defaultChannelEntities = [
  'base',
  'extended',
  'audioCounts',
  'audioConfig',
  'messageConfig'
];

/**
 * @typedef {'base' | 'extended' | 'audioCounts' | 'audioConfig' | 'messageConfig'} ChannelEntities
 */

/**
 * @typedef {Object} BaseOptions
 * @property {boolean} [forceNew]
 */

/**
 * @typedef {BaseOptions & { subscribe?: boolean }} SubscribableOptions
 * @typedef {SubscribableOptions & { extended?: boolean }} ExtendedUserOptions
 * @typedef {SubscribableOptions & { entities?: ChannelEntities[] }} ChannelEntityOptions
 */

// Specific options interfaces
/** @typedef {BaseOptions} AchievementCategoryOptions */
/** @typedef {BaseOptions} AchievementOptions */
/** @typedef {BaseOptions} AudioChannelListOptions */
/** @typedef {SubscribableOptions} ChannelAudioSlotRequestOptions */
/** @typedef {BaseOptions} ChannelCategoryOptions */
/** @typedef {SubscribableOptions} ChannelListOptions */
/** @typedef {ChannelEntityOptions} ChannelOptions */
/** @typedef {BaseOptions} ChannelStatsOptions */
/** @typedef {BaseOptions} ChannelRoleOptions */
/** @typedef {SubscribableOptions} ChannelRoleUserOptions */
/** @typedef {BaseOptions} CharmOptions */
/** @typedef {ExtendedUserOptions} CharmUserStatisticsOptions */
/** @typedef {BaseOptions} CharmUserSummaryOptions */
/** @typedef {SubscribableOptions} ContactOptions */
/** @typedef {SubscribableOptions} EventChannelOptions */
/** @typedef {SubscribableOptions} EventOptions */
/** @typedef {SubscribableOptions} EventSubscriptionOptions */
/** @typedef {SubscribableOptions} NotificationOptions */
/** @typedef {BaseOptions} RoleOptions */
/** @typedef {BaseOptions} SecurityTokenOptions */
/** @typedef {SubscribableOptions} StageSlotOptions */
/** @typedef {BaseOptions} StoreProductOptions */
/** @typedef {BaseOptions} StoreProductProfileOptions */
/** @typedef {ExtendedUserOptions} UserOptions */
/** @typedef {BaseOptions} UserRoleOptions */
/** @typedef {SubscribableOptions} UserPresenceOptions */
/** @typedef {BaseOptions} WOLFStarOptions */

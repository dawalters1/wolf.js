/* eslint-disable custom/auto-sort-imports */
// Shared types
export type ChannelEntities = 'base' | 'extended' | 'audioCounts' | 'audioConfig' | 'messageConfig';

export const defaultChannelEntities: ChannelEntities[] = [
  'base',
  'extended',
  'audioCounts',
  'audioConfig',
  'messageConfig'
];

// Base interfaces
interface BaseOptions {
  forceNew?: boolean;
}
interface SubscribableOptions extends BaseOptions {
  subscribe?: boolean;
}
interface ExtendedUserOptions extends SubscribableOptions {
  extended?: boolean;
}
interface ChannelEntityOptions extends SubscribableOptions {
  entities?: ChannelEntities[];
}

// Specific interfaces (more declarative, less repetition)
export interface AchievementCategoryOptions extends BaseOptions {}
export interface AchievementOptions extends BaseOptions {}
export interface ChannelAudioSlotRequestOptions extends SubscribableOptions {}
export interface ChannelCategoryOptions extends BaseOptions {}
export interface ChannelListOptions extends SubscribableOptions {}
export interface ChannelOptions extends ChannelEntityOptions {}
export interface ChannelStatsOptions extends BaseOptions {}
export interface ChannelRoleOptions extends BaseOptions {}
export interface ChannelRoleUserOptions extends SubscribableOptions {}
export interface CharmOptions extends BaseOptions {}
export interface CharmUserStatisticsOptions extends ExtendedUserOptions {}
export interface CharmUserSummaryOptions extends BaseOptions {}
export interface ContactOptions extends SubscribableOptions {}
export interface EventChannelOptions extends SubscribableOptions {}
export interface EventOptions extends SubscribableOptions {}
export interface EventSubscriptionOptions extends SubscribableOptions {}
export interface NotificationOptions extends SubscribableOptions {}
export interface RoleOptions extends BaseOptions {}
export interface StageSlotOptions extends SubscribableOptions {}
export interface UserOptions extends ExtendedUserOptions {}
export interface UserRoleOptions extends BaseOptions {}
export interface UserPresenceOptions extends SubscribableOptions {}
export interface WOLFStarOptions extends BaseOptions {}

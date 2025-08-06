import {UserPresence} from '../constants/index.js'

// types.d.ts

export const defaultChannelEntities: ChannelEntities[];

/**
 * Union of all allowed channel entity strings.
 */
export type ChannelEntities = 
  | 'base'
  | 'extended'
  | 'audioCounts'
  | 'audioConfig'
  | 'messageConfig';

export interface BaseOptions {
  /**
   * Whether or not to request new data from the service
   */
  forceNew?: boolean;
}

export interface SubscribableOptions extends BaseOptions {
  /**
   * Whether or not to subscribe to updates
   */
  subscribe?: boolean;
}

export interface ExtendedUserOptions extends SubscribableOptions {
  /**
   * Whether or not to request the extended version of an entity
   */
  extended?: boolean;
}

export interface ChannelEntityOptions extends SubscribableOptions {
  entities?: ChannelEntities[];
}

// Specific options interfaces
export type AchievementUserOptions = BaseOptions;
export type AchievementChannelOptions = BaseOptions;
export type AchievementCategoryOptions = BaseOptions;
export type AchievementOptions = BaseOptions;
export type AudioChannelListOptions = BaseOptions;
export type ChannelAudioSlotRequestOptions = SubscribableOptions;
export type ChannelCategoryOptions = BaseOptions;
export type ChannelListOptions = SubscribableOptions;
export type ChannelOptions = ChannelEntityOptions;
export type ChannelStatsOptions = BaseOptions;
export type ChannelRoleOptions = BaseOptions;
export type ChannelRoleUserOptions = SubscribableOptions;
export type CharmOptions = BaseOptions;
export type CharmUserStatisticsOptions = ExtendedUserOptions;
export type CharmUserSummaryOptions = BaseOptions;
export type ContactOptions = SubscribableOptions;
export type EventChannelOptions = SubscribableOptions;
export type EventOptions = SubscribableOptions;
export type EventSubscriptionOptions = SubscribableOptions;
export type NotificationOptions = SubscribableOptions;
export type RoleOptions = BaseOptions;
export type SecurityTokenOptions = BaseOptions;
export type StageSlotOptions = SubscribableOptions;
export type StoreProductOptions = BaseOptions;
export type StoreProductProfileOptions = BaseOptions;
export type UserOptions = ExtendedUserOptions;
export type UserRoleOptions = BaseOptions;
export type UserPresenceOptions = SubscribableOptions;
export type WOLFStarOptions = BaseOptions;

export type LoginOptions = {
  token?: string;
  onlineState?: UserPresence
}
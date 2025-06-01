type ChannelEntities = 'base' | 'extended' | 'audioCounts' | 'audioConfig' | 'messageConfig';

export interface AchievementCategoryOptions{
  forceNew?: false;
}
export interface AchievementOptions{
  forceNew?: false;
}
export interface ChannelListOptions{
  forceNew?: false;
  subscribe?: true;
}
export interface ChannelOptions{
  forceNew?: false;
  subscribe?: true;
  entities?: ChannelEntities[];
}
export interface CharmOptions{
  forceNew?: false;
}
export interface CharmUserStatisticsOptions{
  forceNew?: false;
}
export interface CharmUserSummaryOptions{
  forceNew?: false;
}
export interface ContactOptions{
  forceNew?: false;
  subscribe?: true
}
export const defaultChannelEntities: ChannelEntities[] = [
  'base',
  'extended',
  'audioCounts',
  'audioConfig',
  'messageConfig'
];
export interface EventChannelOptions {
  forceNew?: false;
  subscribe?: true;
}
export interface EventOptions {
  forceNew?: false;
  subscribe?: true;
}
export interface EventSubscriptionOptions {
  forceNew?: false;
  subscribe?: true;
}
export interface NotificationOptions {
  forceNew?: false;
  subscribe?: true;
}
export interface RoleOptions {
  forceNew?: false;
}
export interface StageSlotOptions {
  forceNew?: false;
  subscribe?: true;
}
//

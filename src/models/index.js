/**
 * WORK IN PROGRESS
 */

const Achievement = require('./Achievement');
const AchievementCategory = require('./AchievementCategory');
const AchievementUnlockable = require('./AchievementUnlockable');
const AchievementUnlockableAdditionalInfo = require('./AchievementUnlockableAdditionalInfo');
const Charm = require('./Charm');
const CharmExpiry = require('./CharmExpiry');
const CharmSelected = require('./CharmSelected');
const CharmStatistics = require('./CharmStatistics');
const CharmSummary = require('./CharmSummary');
const Contact = require('./Contact');
const ContactAdditionalInfo = require('./ContactAdditionalInfo');
const Event = require('./Event');
const Group = require('./Group');
const GroupExtended = require('./GroupExtended');
const GroupAudioConfig = require('./GroupAudioConfig');
const GroupAudioCounts = require('./GroupAudioCounts');
const GroupAudioSlot = require('./GroupAudioSlot');
const GroupAudioSlotRequest = require('./GroupAudioSlotRequest');
const GroupAudioSlotUpdate = require('./GroupAudioSlotUpdate');
const GroupMember = require('./GroupMember');
const GroupStats = require('./GroupStats');
const GroupStatsActive = require('./GroupStatsActive');
const GroupStatsDetail = require('./GroupStatsDetail');
const GroupStatsTop = require('./GroupStatsTop');
const GroupStatsTrend = require('./GroupStatsTrend');
const IdHash = require('./IdHash');
const LinkMetadata = require('./LinkMetadata');
const Message = require('./Message');
const MessageEdit = require('./MessageEdit');
const MessageMetadata = require('./MessageMetadata');
const MessageMetadataFormatting = require('./MessageMetadataFormatting');
const MessageMetadataFormattingGroupLink = require('./MessageMetadataFormattingGroupLink');
const MessageMetadataFormattingUrl = require('./MessageMetadataFormattingUrl');
const MessageResponse = require('./MessageResponse');
const MessageSetting = require('./MessageSetting');
const MessageSettingFilter = require('./MessageSettingFilter');
const Notification = require('./Notification');
const NotificationAction = require('./NotificationAction');
const Presence = require('./Presence');
const Response = require('./Response');
const Search = require('./Search');
const Subscriber = require('./Subscriber');
const SubscriberEvent = require('./SubscriberEvent');
const SubscriberEventAdditionalInfo = require('./SubscriberEventAdditionalInfo');
const SubscriberExtended = require('./SubscriberExtended');
const SubscriberSelectedCharm = require('./SubscriberSelectedCharm');
const TimerJob = require('./TimerJob');
const Tip = require('./Tip');
const TipCharm = require('./TipCharm');
const TipContext = require('./TipContext');
const TipDetail = require('./TipDetail');
const TipLeaderboard = require('./TipLeaderboard');
const TipLeaderboardItem = require('./TipLeaderboardItem');
const TipLeaderboardSummary = require('./TipLeaderboardSummary');
const TipSummary = require('./TipSummary');
const Translation = require('./Translation');
const Welcome = require('./Welcome');
const WelcomeEndpoint = require('./WelcomeEndpoint');
const WOLFAPIError = require('./WOLFAPIError');

module.exports = {
  Achievement,
  AchievementCategory,
  AchievementUnlockable,
  AchievementUnlockableAdditionalInfo,
  Charm,
  CharmExpiry,
  CharmSelected,
  CharmStatistics,
  CharmSummary,
  Contact,
  ContactAdditionalInfo,
  Event,
  Group,
  GroupAudioConfig,
  GroupAudioCounts,
  GroupAudioSlot,
  GroupAudioSlotRequest,
  GroupAudioSlotUpdate,
  GroupExtended,
  GroupMember,
  GroupStats,
  GroupStatsActive,
  GroupStatsDetail,
  GroupStatsTop,
  GroupStatsTrend,
  IdHash,
  LinkMetadata,
  Message,
  MessageEdit,
  MessageMetadata,
  MessageMetadataFormatting,
  MessageMetadataFormattingGroupLink,
  MessageMetadataFormattingUrl,
  MessageResponse,
  MessageSetting,
  MessageSettingFilter,
  Notification,
  NotificationAction,
  Presence,
  Response,
  Search,
  Subscriber,
  SubscriberEvent,
  SubscriberEventAdditionalInfo,
  SubscriberExtended,
  SubscriberSelectedCharm,
  TimerJob,
  Tip,
  TipCharm,
  TipContext,
  TipDetail,
  TipLeaderboard,
  TipLeaderboardItem,
  TipLeaderboardSummary,
  TipSummary,
  Translation,
  Welcome,
  WelcomeEndpoint,
  WOLFAPIError
};


import { StatusCodes } from 'http-status-codes';
import { Stream } from 'stream';
import {
  AdminAction,
  Avatar,
  AvatarType,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
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
  UserPresence,
  UserPrivilege,
  WOLFStarTalent
} from '../src/constants/index.js';
import {
  ChannelEntities,
  BaseOptions,
  SubscribableOptions,
  ExtendedUserOptions,
  ChannelEntityOptions,
  AchievementUserOptions,
  AchievementChannelOptions,
  AchievementCategoryOptions,
  AchievementOptions,
  AudioChannelListOptions,
  ChannelAudioSlotRequestOptions,
  ChannelCategoryOptions,
  ChannelListOptions,
  ChannelOptions,
  ChannelStatsOptions,
  ChannelRoleOptions,
  ChannelRoleUserOptions,
  CharmOptions,
  CharmUserStatisticsOptions,
  CharmUserSummaryOptions,
  ContactOptions,
  EventChannelOptions,
  EventOptions,
  EventSubscriptionOptions,
  NotificationOptions,
  RoleOptions,
  SecurityTokenOptions,
  StageSlotOptions,
  StoreProductOptions,
  StoreProductProfileOptions,
  UserOptions,
  UserRoleOptions,
  UserPresenceOptions,
  WOLFStarOptions,
  LoginOptions
} from '../src/options/options.d.ts';

export class WOLFResponse<T = undefined> {

  /**
   * HttpStatus
   */
  code: StatusCodes;
  /**
   * The body
   */
  body?: T;
  /**
   * The headers 
   */
  headers?: Map<any, any>;
  /**
   * Whether or not the response code is between 200 and 299
   */
  success: boolean;
};

export class WOLF {

    readonly config: any;
    readonly utility: BaseUtility;
    readonly multimedia: MultimediaClient;
    readonly achievement: AchievementHelper;
    readonly audio: AudioHelper;
    readonly authorisation: AuthorisationHelper;
    readonly banned: BannedHelper;
    readonly channel: ChannelHelper;
    readonly charm: CharmHelper;
    readonly contact: ContactHelper;
    readonly event: EventHelper;
    readonly messaging: MessagingHelper;
    readonly notification: NotificationHelper;
    readonly phrase: PhraseHelper;
    readonly user: UserHelper;
    readonly security: SecurityHelper;
    readonly store: StoreHelper;
    readonly tip: TipHelper;
    readonly topic: TopicHelper;
    readonly role: RoleHelper;
    readonly metadata: MetadataHelper;

    readonly me?: CurrentUserEntity;

    readonly SPLIT_REGEX: RegExp;

    /**
     * Login using credentials from config
     */
    login(): void;
    /**
     * Login using credentials other than the config
     * @param email - The email associated with the bot account 
     * @param password - The password
     * @param apiKey - The apiKey provided upon approval
     * @param opts - The additional login options
     */
    login(email: string, password: string, apiKey: string, opts?: LoginOptions): void;
};

export class AchievementHelper {


  readonly category: AchievementCategoryHelper;
  readonly channel: AchievementChannelHelper;
  readonly user: AchievementUserHelper;

  /**
   * Request an achievement 
   * @param achievementId - The achievement id
   * @param languageId - The language of the achievement to request
   * @param opts - The request options
   */
  getById(achievementId: number, languageId: Language, opts?: AchievementOptions): Promise<AchievementEntity|null>;
 
  /**
   * Request multiple achievements
   * @param achievementIds - The achievement ids
   * @param languageId - The language of the achievements to request
   * @param opts - The request options
   */
  getByIds(achievementIds: number[], languageId: Language, opts?: AchievementOptions): Promise<(AchievementEntity|null)[]>;
}

export class AchievementCategoryHelper {

  /**
   * Request the list of achievement categories
   * @param languageId - The language of the achievement categories to request
   * @param opts - The request options
   */
  list(languageId: Language, opts?: AchievementCategoryOptions): Promise<AchievementCategoryEntity[]>
}

export class AchievementChannelHelper {

  /**
   * Request all or a specific acheivement belonging to a channel
   * @param channelId - The id belonging to the channel
   * @param parentId - Optional - The achievement ID you are wanting
   * @param opts - The request options
   */
  get(channelId: number, parentId?: number, opts: AchievementChannelOptions): Promise<(AchievementChannelEntity|null)[]>
}

export class AchievementUserHelper {
  /**
   * Request all or a speciifc achievement belonging to a user
   * @param userId - The id belonging to the user
   * @param parentId - Optional - The acheivement ID you are wanting
   * @param opts - The request options
   */
  get(userId: number, parentId?: number, opts: AchievementUserOptions): Promise<(AchievementUserEntity|null)[]>
}

export type {
  AdminAction,
  Avatar,
  AvatarType,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
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
  UserPresence,
  UserPrivilege,
  WOLFStarTalent
};

export type {
  ChannelEntities,
  BaseOptions,
  SubscribableOptions,
  ExtendedUserOptions,
  ChannelEntityOptions,
  AchievementCategoryOptions,
  AchievementOptions,
  AudioChannelListOptions,
  ChannelAudioSlotRequestOptions,
  ChannelCategoryOptions,
  ChannelListOptions,
  ChannelOptions,
  ChannelStatsOptions,
  ChannelRoleOptions,
  ChannelRoleUserOptions,
  CharmOptions,
  CharmUserStatisticsOptions,
  CharmUserSummaryOptions,
  ContactOptions,
  EventChannelOptions,
  EventOptions,
  EventSubscriptionOptions,
  NotificationOptions,
  RoleOptions,
  SecurityTokenOptions,
  StageSlotOptions,
  StoreProductOptions,
  StoreProductProfileOptions,
  UserOptions,
  UserRoleOptions,
  UserPresenceOptions,
  WOLFStarOptions,
  LoginOptions
};
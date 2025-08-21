
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

export class AudioHelper {

}

export class AudioSlotHelper {

}

export class AudioSlotRequestHelper {

}

export class AuthorisationHelper {

}

export class BannedHelper {

}

export class ChannelHelper {

}

export class ChannelCategoryHelper {

}

export class ChannelMemberHelper {

}

export class ChannelRoleHelper {

}

export class CharmHelper {

}

export class ContactHelper {

}

export class BlockedHelper {
   
}

export class EventHelper {

}

export class EventChannelHelper {

}

export class EventSubscriptionHelper {

}

export class MessagingHelper {

}

export class MetadataHelper {

  metadata(url: string): Promise<MetadataUrl>
  urlBlacklist(opts?: MetadataUrlBlacklistOptions): Promise<MetadataUrlBlacklist[]>
}

export class NotificationHelper {

  global: readonly NotificationGlobalHelper;
  user: readonly NotificationUserHelper;
}

export class NotificationGlobalHelper {

  list(opts?: NotificationListOptions): Promise<NotificationEntity[]>
  clear(): Promise<WOLFResponse>
  deleteById(notificationId: number): Promise<WOLFResponse>
  deleteByIds(notificationIds: number): Promise<WOLFResponse>
  getById(notificationId: number, opts?: NotificationOptions): Promise<NotificationGlobalEntity|null>;
  getByIds(notificationIds: number[], opts?: NotificationOptions): Promise<(NotificationGlobalEntity|null)[]>;
}

export class NotificationUserHelper {
list(opts?: NotificationListOptions): Promise<NotificationEntity[]>
  clear(): Promise<WOLFResponse>
  deleteById(notificationId: number): Promise<WOLFResponse>
  deleteByIds(notificationIds: number): Promise<WOLFResponse>
  getById(notificationId: number, opts?: NotificationOptions): Promise<NotificationUserEntity|null>;
  getByIds(notificationIds: number[], opts?: NotificationOptions): Promise<(NotificationUserEntity|null)[]>;
}

export class PhraseHelper {
   
  reload(): void;
  register(phrases: PhraseEntity): void;
  getByLanguageAndName(language: string, name: string): string;
  getByCommandAndName(command: CommandContext, name: string): string;
  getAllByName(name: string): PhraseEntity[];
  isRequestedPhrase(name: string, input: string): boolean;
}

export class RoleHelper {
  getById(userId: number, opts?: RoleOptions): Promise<RoleEntity | null>;
  getByIds(userIds: number[], opts?: RoleOptions): Promise<(RoleEntity|null)[]>
}

export class SecurityHelper {

  login(email: string, password: string, state?: UserPresence): Promise<WOLFResponse>;
  logout(): Promise<WOLFResponse>
  getToken(opts?: SecurityTokenOptions): Promise<CognitoEntity>
}

export class StoreHelper {

}

export class StoreProductHelper {

}

export class StoreProductProfileHelper {

}

export class TipHelper {

  tip(channelId: number, userId: number, context: TipContextEntity, charms: TipCharm[]): Promise<WOLFResponse>
  getDetails(channelId: number, timestamp: number): Promise<TipDetailEntity[]>
  getSummary(channelId: number, timestamp: number): Promise<TipSummary|null>
  getSummaries(channelId: number, timestamp: number[]): Promise<(TipSummary|null)[]>
  getChannelLeaderboard(channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboardEntity|null>;
  getChannelleaderboardSummary(channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboardEntity|null>;
  getGlobalLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboardEntity|null>;
  getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<TipLeaderboardEntity|null>;
}

export class UserHelper {

  followers: readonly UserFollowerHelper;
  wolfstar: readonly WOLFStarHelper;
  role: readonly UserRoleHelper;
  presence: readonly UserPresenceHelper;

  getById(userId: number, opts?: UserPresenceOptions): Promise<UserEntity | null>;
  getByIds(userIds: number[], opts?: UserPresenceOptions): Promise<(UserEntity|null)[]>
  search(query: String): Promise<SearchEntity[]>
}

export class UserPresenceHelper {
  getById(userId: number, opts?: UserPresenceOptions): Promise<UserPresenceEntity | null>;
  getByIds(userIds: number[], opts?: UserPresenceOptions): Promise<(UserPresenceEntity|null)[]>

}

//TODO: refactor this class it is ass.
export class UserFollowerHelper {


}

export class UserRoleHelper {
  getById(userId: number, opts?: UserRoleOptions): Promise<UserRoleEntity | null>;
  getByIds(userIds: number[], opts?: UserRoleOptions): Promise<(UserRoleEntity|null)[]>
}

export class WOLFStarHelper {

  getById(userId: number, opts?: WOLFStarOptions): Promise<WOLFStarEntity | null>;
  getByIds(userIds: number[], opts?: WOLFStarOptions): Promise<(WOLFStarEntity|null)[]>
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
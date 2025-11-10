
import BaseExpireProperty from "../caching/BaseExpireProperty.js";
import BaseStore from "../caching/BaseStore.js";
import ChannelMember from "./channelMember.js";
import WOLFResponse from "./WOLFResponse.js";
import {MessageSendOptions} from '../options/options.js';
import { EventEmitter } from 'node:events';

import {
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
} from './constants.js';

export default class WOLF extends EventEmitter {
  constructor();

  loggedIn: boolean;
  commandManager?: CommandManager | undefined;
  me: CurrentUser | undefined;

  config: any;
  utility: Utility;
  multimedia: Multimedia;
  websocket: Websocket;
  achievement: AchievementHelper;
  audio: AudioHelper;
  authorisation: AuthorisationHelper;
  banned: BannedHelper;
  channel: ChannelHelper;
  charm: CharmHelper;
  contact: ContactHelper;
  event: EventHelper;
  messaging: MessagingHelper;
  notification: NotificationHelper;
  phrase: PhraseHelper;
  user: UserHelper;
  security: SecurityHelper;
  store: StoreHelper;
  tip: TipHelper;
  topic: TopicHelper;
  role: RoleHelper;
  metadata: MetadataHelper;

  readonly SPLIT_REGEX: RegExp;

  login(
    /**
     * The email associated with the account
     */
    email?: string,
    /**
     * The password associated with the account
     */
    password?: string,
    /**
     * The API key provided by WOLF
     */
    apiKey?: string,
    /**
     * Additional login options
     */
    opts?: LoginOptions
  ): Promise<void>;  
  
  constructor(client: WOLF);
}

export type CommandCallback = (commandContext: CommandContext) => any;

export interface CommandCallbackMap {
  channel?: CommandCallback;
  private?: CommandCallback;
  both?: CommandCallback;
}

export declare class Command {
  static readonly getCallback: {
    CHANNEL: 'channel';
    PRIVATE: 'private';
    BOTH: 'both';
  };
  constructor(
    key: string,
    callbackObject: CommandCallbackMap,
    children?: Command[]
  );
}

export class CommandManager {

  /**
   * Register the commands
   * @param commands The commands to register
   */
  register(commands: Command[]): void;

  constructor(client: WOLF);
}


export class BaseEntity {
  /**
   * Creates an instance of BaseEntity.
   * @param client The client instance
   */
  constructor(client: WOLF);

  /**
   * Gets the client instance.
   */
  get client(): WOLF;

  /** @internal */
  protected patch(newData: Record<string, any>, oldData?: Record<string, any> | null): void;

  /** @internal */
  protected clone<T = this>(): T;

  /** @internal */
  protected json(): Record<string, any>;  
  
  constructor(client: WOLF);
}

export class AchievementHelper extends BaseHelper {
  /**
   * The achievement category helper
   */
  get category(): AchievementCategoryHelper;
  /**
   * The achievement channel helper
   */
  get channel(): AchievementChannelHelper;
  /**
   * The achievement user helper
   */
  get user(): AchievementUserHelper;
  /**
   * Fetch an achievement
   * @param achievementId The ID of the achievement
   * @param languageId The language of the achievement
   * @param opts The request options
   */
  getById(achievementId: number, languageId: number, opts?: AchievementOptions): Promise<Achievement | null>;
  /**
   * Fetch multiple achievements
   * @param achievementIds The ID of the achievements
   * @param languageId The language of the achievements
   * @param opts The request options
   */
  getByIds(achievementIds: number[], languageId: number, opts?: AchievementOptions): Promise<(Achievement | null)[]>;

  constructor(client: WOLF);
}

export class AchievementCategoryHelper extends BaseHelper {
  /**
   * Fetch the achievement categories
   * @param languageId The language of the achievement categories
   * @param opts The request options
   */
  list(languageId: number, opts?: AchievementCategoryOptions): Promise<AchievementCategory[]>;
  
  constructor(client: WOLF);
}

export class AchievementChannelHelper extends BaseHelper {
  /**
   * Fetch a channels achievements
   * @param channelId The ID of the channel
   * @param parentId The ID of the parent achievement (Leave null to request all)
   * @param opts The request options
   */
  get(channelId: number, parentId?: number, opts?: AchievementChannelOptions): Promise<AchievementChannel[]>;  
  
  constructor(client: WOLF);
}

export class AchievementUserHelper extends BaseHelper {
  /**
   * Fetch a users achievements
   * @param userId The ID of the user
   * @param parentId The ID of the parent achievement (Leave null to request all)
   * @param opts The request options
   */
  get(userId: number, parentId?: number, opts?: AchievementUserOptions): Promise<AchievementUser[]>;  
  
  constructor(client: WOLF);
}

export class AudioHelper extends BaseHelper {  
  get slots(): AudioSlotHelper;  
  get slotRequest(): AudioSlotRequestHelper;  
  getAvailableList(channelId: number, opts?: any): Promise<ChannelStage[]>;  
  getAudioConfig(channelId: number, opts?: any): Promise<any>;  
  getAudioCount(channelId: number, opts?: any): Promise<any>;  
  updateAudioConfig(channelId: number, opts?: any): Promise<any>;  
  play(channelId: number, stream: Stream): Promise<any>;  
  stop(channelId: number): Promise<any>;  
  pause(channelId: number): Promise<any>;  
  resume(channelId: number): Promise<any>;  
  hasClient(channelId: number): Promise<boolean>;  
  getClientState(channelId: number): Promise<{ connectionState: any; broadcastState: any }>;  
  getClientSettings(channelId: number): Promise<any>;  
  updateClientSettings(channelId: number, settings: any): Promise<void>;  
  
  constructor(client: WOLF);
}

export class AudioSlotHelper extends BaseHelper {
  list(channelId: number, opts?: any): Promise<ChannelAudioSlot[]>;
  get(channelId: number, slotId: number): Promise<ChannelAudioSlot | null>;
  lock(channelId: number, slotId: number): Promise<any>;
  unlock(channelId: number, slotId: number): Promise<any>;
  mute(channelId: number, slotId: number): Promise<any>;
  unmute(channelId: number, slotId: number): Promise<any>;
  kick(channelId: number, slotId: number): Promise<any>;
  join(channelId: number, slotId: number): Promise<any>;
  leave(channelId: number, slotId: number): Promise<any>;
  audioClients: Map<number, AudioClient>;  
  
  constructor(client: WOLF);
}

export class AudioSlotRequestHelper extends BaseHelper {
  /**
   * Fetch a channels slot requests
   * @param channelId The ID of the channel
   * @param opts The request options
   */
  list(channelId: number, opts?: any): Promise<ChannelAudioSlotRequest[]>;
  /**
   * Add or request an audio slot
   * @param channelId The ID of the channel
   * @param slotId The ID of the slot
   * @param userId The ID of the user (Leave null to have the bot request a slot)
   */
  add(channelId: number, slotId?: number, userId?: number): Promise<WOLFResponse>;
  /**
   * Remove/Cancel an audio slot request
   * @param channelId The ID of the channel
   * @param slotId The ID of the slot
   */
  remove(channelId: number, slotId?: number): Promise<WOLFResponse>;
  /**
   * Clear all audio slot requests
   * @param channelId The ID of the channel
   */
  clear(channelId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class AuthorisationHelper extends BaseHelper {
  /**
   * Get all authorised users
   */
  list(): number[];
  /**
   * Check to see if a user is authorised
   * @param userIds The ID or IDs of the users to check
   */
  isAuthorised(userIds: number | number[]): boolean | boolean[];
  /**
   * Authorise a user
   * @param userId The ID of the user
   */
  authorise(userId: number): Promise<boolean>;
  /**
   * Authorise multiple users
   * @param userIds The IDs of the users
   */
  authoriseAll(userIds: number[]): Promise<boolean[]>;
  /**
   * Unauthorise a user
   * @param userId The ID of the user
   */
  deauthorise(userId: number): boolean;
  /**
   * Unauthorise multiple users
   * @param userIds The IDs of the users
   */
  deauthoriseAll(userIds: number[]): boolean[];
  /**
   * Unauthorise a user
   * @param userId The ID of users
   */
  unauthorise(userId: number): boolean;
  /**
   * Unauthorise multiple users
   * @param userIds The IDs of the users
   */
  unauthoriseAll(userIds: number[]): boolean;
  /**
   * Clear the authorised list
   */
  clear(): void;
}

export class BannedHelper extends BaseHelper {
  /**
   * Get all the banned users
   */
  list(): number[];
  /**
   * Check to see if a user is banned
   * @param userIds The ID or IDs of the users to check
   */
  isBanned(userIds: number | number[]): boolean | boolean[];
  /**
   * Ban a user
   * @param userId The ID of the user
   */
  ban(userId: number): Promise<boolean>;
  banAll(userIds: number[]): Promise<boolean[]>;
  unban(userId: number): boolean;
  unbanAll(userIds: number[]): boolean[];
  clear(): void;
}

export class ChannelHelper extends BaseHelper {
  readonly category: ChannelCategoryHelper;
  readonly member: ChannelMemberHelper;
  readonly roles: ChannelRoleHelper;
  getById(channelId: number, opts?: ChannelOptions): Promise<Channel | null>;
  getByIds(channelIds: number[], opts?: ChannelOptions): Promise<(Channel | null)[]>;
  getByName(name: string, opts?: ChannelOptions): Promise<Channel | null>;
  getChatHistory(channelId: number, chronological?: boolean, timestamp?: number, limit?: number): Promise<Message[]>;
  getStats(channelId: number, opts?: ChannelStatsOptions): Promise<ChannelStats>;
  getRecommendations(): Promise<IdHash[]>;
  joinById(channelId: number, password?: string): Promise<WOLFResponse>;
  joinByName(name: string, password?: string): Promise<WOLFResponse>;
  leaveById(channelId: number): Promise<WOLFResponse>;
  leaveByName(name: string): Promise<WOLFResponse>;
  list(opts?: any): Promise<Channel[]>;
  search(query: string): Promise<Search[]>;  
  
  constructor(client: WOLF);
}

export class ChannelCategoryHelper extends BaseHelper {
  list(languageId: number, opts?: ChannelCategoryOptions): Promise<ChannelCategory[]>;  
  
  constructor(client: WOLF);
}

export class ChannelMemberHelper extends BaseHelper {
  getList(channelId: number, list: ChannelMemberListType): Promise<ChannelMember[]>;
  getMember(channelId: number, userId: number): Promise<ChannelMember | null>;
  coowner(channelId: number, userId: number): Promise<WOLFResponse>;
  admin(channelId: number, userId: number): Promise<WOLFResponse>;
  mod(channelId: number, userId: number): Promise<WOLFResponse>;
  regular(channelId: number, userId: number): Promise<WOLFResponse>;
  silence(channelId: number, userId: number): Promise<WOLFResponse>;
  ban(channelId: number, userId: number): Promise<WOLFResponse>;
  kick(channelId: number, userId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}


export class ChannelRoleHelper extends BaseHelper {
  roles(channelId: number, opts?: any): Promise<ChannelRole[]>;
  users(channelId: number, opts?: any): Promise<ChannelRoleUser[]>;
  assign(channelId: number, userId: number, roleId: number): Promise<WOLFResponse>;
  unassign(channelId: number, userId: number, roleId: number): Promise<WOLFResponse>;
  reassign(channelId: number, oldUserId: number, newUserId: number, roleId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class CharmHelper extends BaseHelper {
  getById(charmId: number, languageId: number, opts?: any): Promise<Charm | null>;
  getByIds(charmIds: number[], languageId: number, opts?: any): Promise<(Charm | null)[]>;
  getUserSummary(userId: number, opts?: any): Promise<CharmSummary[]>;
  getUserStatistics(userId: number, opts?: any): Promise<CharmStatistic | null>;  
  
  constructor(client: WOLF);
}

export class BlockedHelper extends BaseHelper {
  list(opts?: ContactOptions): Promise<Contact[]>;
  isBlocked(userId: number): Promise<boolean>;
  block(userId: number): Promise<WOLFResponse>;
  unblock(userId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class ContactHelper extends BaseHelper {
  readonly blocked: BlockedHelper;
  list(opts?: ContactOptions): Promise<Contact[]>;
  isContact(userId: number): Promise<boolean>;
  add(userId: number): Promise<WOLFResponse>;
  delete(userId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}
export class EventHelper extends BaseHelper {
  readonly channel: EventChannelHelper;
  readonly subscription: EventSubscriptionHelper;
  getById(eventId: number, opts?: EventOptions): Promise<Event | null>;
  getByIds(eventIds: number[], opts?: EventOptions): Promise<(Event | null)[]>;  
  
  constructor(client: WOLF);
}


export class EventChannelHelper extends BaseHelper {

  list(channelId: number, opts?: EventChannelOptions): Promise<ChannelEvent[]>;
  create(channelId: number, eventData: any): Promise<Event>;
  update(channelId: number, eventId: number, eventData: any): Promise<Event>;
  delete(channelId: number, eventId: number): Promise<any>;  
  
  constructor(client: WOLF);
}

export class EventSubscriptionHelper extends BaseHelper {
  list(opts?: any): Promise<EventSubscription[]>;
  add(eventId: number): Promise<WOLFResponse>;
  remove(eventId: number): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class MessagingHelper extends BaseHelper {
  sendChannelMessage(channelId: number, content: string | Buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  sendPrivateMessage(userId: number, content: string | Buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  deleteMessage(targetId: number, timestamp: number, isChannel?: boolean): Promise<any>;
  restoreMessage(targetId: number, timestamp: number, isChannel?: boolean): Promise<any>;  
  
  constructor(client: WOLF);
}

export class MetadataHelper extends BaseHelper {
  metadata(url: string): Promise<Metadata>;
  urlBlacklist(opts?: any): Promise<Blacklist[]>;  
  
  constructor(client: WOLF);
}

export class NotificationHelper extends BaseHelper {
  readonly global: NotificationGlobalHelper;
  readonly user: NotificationUserHelper;
}

export class NotificationGlobalHelper extends BaseHelper {
  list(opts?: NotificationOptions): Promise<any>;
  clear(): Promise<WOLFResponse>;
  deleteById(notificationId: number): Promise<WOLFResponse>;
  deleteByIds(notificationIds: number[]): Promise<WOLFResponse>;
  getById(notificationId: number, opts?: any): Promise<Notification|null>;
  getByIds(notificationIds: number[], opts?: any): Promise<(Notification|null)[]>;  
  
  constructor(client: WOLF);
}

export class NotificationUserHelper extends BaseHelper {
  list(opts?: NotificationOptions): Promise<any>;
  clear(): Promise<WOLFResponse>;
  deleteById(notificationId: number): Promise<WOLFResponse>;
  deleteByIds(notificationIds: number[]): Promise<WOLFResponse>;
  getById(notificationId: number, opts?: any): Promise<Notification|null>;
  getByIds(notificationIds: number[], opts?: any): Promise<(Notification|null)[]>;  
  
  constructor(client: WOLF);
}

export class PhraseHelper extends BaseHelper {
  reload(): void;
  register(phrases: { name: string; value: string; language: string }[]): void;
  getByLanguageAndName(language: string, name: string): string;
  getByCommandAndName(command: Command, name: string): string;
  getAllByName(name: string): string[];
  isRequestedPhrase(name: string, input: string): boolean;
}

export class RoleHelper extends BaseHelper {
  getById(roleId: number, languageId: number, opts?: any): Promise<Role|null>;
  getByIds(roleIds: number[], languageId: number, opts?: any): Promise<(Role|null)[]>;  
  
  constructor(client: WOLF);
}

export class SecurityHelper extends BaseHelper {
  login(email: string, password: string): Promise<WOLFResponse>;
  logout(): Promise<WOLFResponse>;
  getToken(opts?: any): Promise<Cognito>;  
  
  constructor(client: WOLF);
}

export class StoreHelper extends BaseHelper {
  readonly product: StoreProductHelper;
  balance(opts?: StoreBalanceOptions): Promise<number>;  
  
  constructor(client: WOLF);
}

export class StoreProductHelper extends BaseHelper {
  readonly profile: StoreProductProfileHelper;
  getById(productId: number, languageId: number, opts?: StoreProductOptions): Promise<StoreProduct | null>;
  getByIds(productIds: number[], languageId: number, opts?: StoreProductOptions): Promise<(StoreProduct | null)[]>;
  /** NOT IMPLEMENTED */
  purchase(): Promise<any>;  
  
  constructor(client: WOLF);
}

export class StoreProductProfileHelper extends BaseHelper {
  get(productId: number, languageId: number, opts?: any): Promise<StoreProductProfile | null>;  
  
  constructor(client: WOLF);
}

export class TipHelper extends BaseHelper {
  tip(channelId: number, userId: number, context: ContextType, charms: any[]): Promise<WOLFResponse>;
  getDetails(channelId: number, timestamp: number): Promise<TipDetail | null>;
  getSummary(channelId: number, timestamp: number): Promise<TipSummary | null>;
  getSummaries(channelId: number, timestamps: number[]): Promise<(TipSummary | null)[]>;
  getChannelLeaderboard(channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboard[]>;
  getChannelleaderboardSummary(channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboardSummary[]>;
  getGlobalLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboard[]>;
  getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<TipLeaderboardSummary[]>;  
  
  constructor(client: WOLF);
}

export class TopicHelper extends BaseHelper {
  readonly recipe: TopicRecipeHelper;
  get(name: string, languageId: Language, opts?: any): Promise<TopicPage | null>;  
  
  constructor(client: WOLF);
}

export class TopicRecipeHelper extends BaseHelper {
  get(
    id: number,
    languageId: Language,
    type: TopicPageRecipeType,
    opts?: any
  ): Promise<TopicRecipe[]>;  
  
  constructor(client: WOLF);
}

export declare class UserFollowerHelper extends BaseHelper {
  count(userId: number, direction: UserFollowerType, opts?: any): Promise<number>;
  list(direction: UserFollowerType, opts?: any): Promise<(UserFollow | UserFollower)[]>;
  follow(userId: number): Promise<WOLFResponse>;
  unfollow(userId: number): Promise<WOLFResponse>;
  update(userId: number, notificationState: boolean): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export declare class UserHelper extends BaseHelper {
  readonly followers: UserFollowerHelper;
  readonly wolfstar: WOLFStarHelper;
  readonly role: UserRoleHelper;
  readonly presence: UserPresenceHelper;

  getById(userId: number, opts?: UserOptions): Promise<User | CurrentUser | null>;
  getByIds(userIds: number[], opts?: UserOptions): Promise<(User | CurrentUser | null)[]>;
  search(query: string): Promise<Search[]>;  
  
  constructor(client: WOLF);
}

export declare class UserPresenceHelper extends BaseHelper {
  getById(userId: number, opts?: UserPresenceOptions): Promise<UserPresence | null>;
  getByIds(userIds: number[], opts?: UserPresenceOptions): Promise<(UserPresence | null)[]>;  
  
  constructor(client: WOLF);
}

export declare class UserRoleHelper extends BaseHelper {
  getById(userId: number, opts?: UserRoleOptions): Promise<UserRole[]>;  
  
  constructor(client: WOLF);
}

export declare class WOLFStarHelper extends BaseHelper {
  getById(userId: number, opts?: WOLFStarOptions): Promise<WOLFStar | null>;
  getByIds(userIds: number[], opts?: WOLFStarOptions): Promise<(WOLFStar | null)[]>;  
  
  constructor(client: WOLF);
}

export class Achievement extends BaseEntity {
  id: number;
  languageId: Language;
  parentId: number | null;
  typeId: number | null;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  levelId: number | null;
  levelName: string | null;
  acquisitionPercentage: number | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class AchievementCategory extends BaseEntity {
  id: number;
  name: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class AchievementChannel extends BaseEntity {
  id: number;
  additionalInfo: AchievementChannelAdditionalInfo;
  childrenId: number | null;

  constructor(
    client: WOLF,
    entity: any
  );

  achievement(languageId: Language): Promise<Achievement | null>;  
  
  constructor(client: WOLF);
}

export class AchievementChannelAdditionalInfo extends BaseEntity {
  awardedAt: Date | null;
  eTag: string | null;
  steps: number | null;
  total: number | null;
  categoryId: number | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class AchievementUser extends BaseEntity {
  id: number;
  additionalInfo: AchievementUserAdditionalInfo;
  childrenId: number | null;

  constructor(
    client: WOLF,
    entity: any
  );

  achievement(languageId: Language): Promise<Achievement | null>;  
  
  constructor(client: WOLF);
}

export class AchievementUserAdditionalInfo extends BaseEntity {
  awardedAt: Date | null;
  eTag: string | null;
  steps: number | null;
  total: number | null;
  categoryId: number | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Ad extends BaseEntity {
  start: number;
  end: number;
  ad: string;
  channelName: string;

  constructor(
    client: WOLF,
    entity: any
  );

  /**
   * Get the specified Channel
   */
  channel(opts?: any): Promise<Channel | null>;  
  
  constructor(client: WOLF);
}

export class Blacklist extends BaseEntity {
  id: number;
  regex: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Channel extends BaseEntity {
  id: number;
  giftAnimationDisabled: boolean;
  name: string;
  hash: string | null;
  reputation: number;
  premium: boolean;
  icon: string | null;
  iconHash: string | null;
  iconInfo: IconInfo | null;
  memberCount: number;
  official: boolean;
  peekable: boolean;
  owner: ChannelOwner;
  extended: ChannelExtended | null;
  audioConfig: ChannelAudioConfig | null;
  audioCount: ChannelAudioCount | null;
  messageConfig: ChannelMessageConfig | null;
  verificationTier: ChannelVerificationTier;
  isMember: boolean;
  capabilities: ChannelMemberCapability;
  language: Language;

  constructor(
    client: WOLF,
    entity: any
  );

  get isOwner(): boolean;

  hasCapability(required: ChannelMemberCapability): boolean;

  canPerformActionAgainstMember(
    targetMember: ChannelMember,
    targetCapability: ChannelMemberCapability
  ): Promise<boolean>;

  join(password?: string): Promise<WOLFResponse>;
  leave(): Promise<WOLFResponse>;
  getAudioConfig(): Promise<ChannelAudioConfig | null>;
  getAudioSlots(): Promise<ChannelAudioSlot[]>;
  getAchievements(parentId?: number): Promise<AchievementChannel[]>;
  getAudioSlotRequests(): Promise<ChannelAudioSlotRequest[]>;
  getEvents(): Promise<ChannelEvent[]>;
  getMember(userId: number): Promise<ChannelMember|null>;
  getMembers(list: any): Promise<ChannelMember[]>;
  getRoles(): Promise<ChannelRole[]>;
  getRoleUsers(): Promise<ChannelRoleUser[]>;
  getStages(): Promise<ChannelStage[]>;  
  
  constructor(client: WOLF);
}

export class ChannelAudioConfig extends BaseEntity {
  id: number;
  enabled: boolean;
  stageId: number;
  minRepLevel: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelAudioCount extends BaseEntity {
  broadcasterCount: number;
  consumerCount: number;
  id: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelAudioSlot extends BaseEntity {
  id: number;
  channelId: number;
  isLocked: boolean;
  isMuted: boolean;
  userId: number | null;
  isReserved: boolean;
  reservation?: ChannelAudioSlotReservation;
  connectionState: any;
  uuid: string;
  isOccupied: boolean;

  constructor(
    client: WOLF,
    entity: any,
    channelId: number
  );

  join(): Promise<WOLFResponse>;
  leave(): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class ChannelAudioSlotRequest extends BaseEntity {
  reservedUserId: number;
  channelId: number;
  reservedExpiresAt: Date;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelAudioSlotReservation extends BaseEntity {
  userId: number;
  expiresAt: Date;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelCategory extends BaseEntity {
  id: number;
  languageId: Language;
  description: string | null;
  imageUrl: string | null;
  name: string;
  pageName: string;
  recipeId: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelEvent extends BaseEntity {
  id: number;
  additionalInfo: ChannelEventAdditionalInfo;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelEventAdditionalInfo extends BaseEntity {
  eTag: string;
  endsAt: Date;
  startsAt: Date;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelExtended extends BaseEntity {
  id: number;
  discoverable: boolean;
  advancedAdmin: boolean;
  locked: boolean;
  hub: ChannelHub;
  questionable: boolean;
  entryLevel: number;
  passworded: boolean;
  language: any | null;
  longDescription: string | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelMember extends BaseEntity {
  id: number;
  channelId: number;
  hash: string;
  capabilities: ChannelMemberCapability;
  lists: Set<ChannelMemberListType>;

  constructor(
    client: WOLF,
    entity: any,
    channelId: number,
    source?: ChannelMemberListType
  );

  regular(): Promise<WOLFResponse>;
  mod(): Promise<WOLFResponse>;
  admin(): Promise<WOLFResponse>;
  coowner(): Promise<WOLFResponse>;
  kick(): Promise<WOLFResponse>;
  ban(): Promise<WOLFResponse>;
  message(content: string | Buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;  
  
  constructor(client: WOLF);
}

export class ChannelMessageConfig extends BaseEntity {
  disableImage: boolean;
  disableImageFilter: boolean;
  disableVoice: boolean;
  disableHyperlink: boolean;
  slowModeRateInSeconds: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelOwner extends BaseEntity {
  id: number;
  hash: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelRole extends BaseEntity {
  roleId: number;
  userIdList: Set<number>;
  maxSeats: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelRoleUser extends BaseEntity {
  userId: number;
  roleId: number;
  channelId: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStage extends BaseEntity {
  id: number;
  expireTime: Date | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStats extends BaseEntity {
  details: ChannelStatsDetails;
  trends: ChannelStatsTrend[];
  trendsHour: ChannelStatsTrend[];
  trendsDay: ChannelStatsTrend[];
  top25: ChannelStatsDetails[];
  next30: ChannelStatsDetails[];
  topWord: ChannelStatsTop[];
  topText: ChannelStatsTop[];
  topQuestion: ChannelStatsTop[];
  topEmoticon: ChannelStatsTop[];
  topHappy: ChannelStatsTop[];
  topSad: ChannelStatsTop[];
  topSwear: ChannelStatsTop[];
  topImage: ChannelStatsTop[];
  topAction: ChannelStatsTop[];

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStatsDetails extends BaseEntity {
  id: number;
  actionCount: number;
  emoticonCount: number;
  channelId: number;
  happyEmoticonCount: number;
  imageCount: number;
  lineCount: number;
  memberCount: number;
  name: string;
  owner?: ChannelStatsOwner;
  message: string;
  nickname: string;
  packCount: number;
  questionCount: number;
  randomQuote: string;
  sadEmoticonCount: number;
  userId: number;
  swearCount: number;
  textCount: number;
  voiceCount: number;
  wordCount: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStatsOwner extends BaseEntity {
  level: number;
  nickname: string;
  userId: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStatsTop extends BaseEntity {
  nickname: string;
  randomQuote: string;
  userId: number;
  wordsPerLine: number;
  value: number;
  percentage: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ChannelStatsTrend extends BaseEntity {
  day: string;
  hour: number;
  lineCount: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Charm extends BaseEntity {
  id: number;
  languageId: Language;
  cost: number;
  description: string;
  imageUrl: string;
  name: string;
  productId: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CharmActive extends BaseEntity {
  id: number;
  charmId: number;
  userId: number;
  sourceUserId: number;
  expireTime: Date | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CharmExpired extends BaseEntity {
  id: number;
  charmId: number;
  userId: number;
  sourceUserId: number;
  expireTime: Date | null;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CharmStatistic extends BaseEntity {
  extended: CharmStatisticExtended | null;
  totalActive: number;
  totalExpired: number;
  totalGiftedReceived: number;
  totalGiftedSent: number;
  totalLifetime: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CharmStatisticExtended extends BaseEntity {
  mostGiftedReceivedCharmId: number;
  mostGiftedSentCharmId: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CharmSummary extends BaseEntity {
  charmId: number;
  expireTime: Date | null;
  giftCount: number;
  total: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Cognito extends BaseEntity {
  identity: string;
  token: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CommandContext extends BaseEntity {
  isChannel: boolean;
  body: string;
  language: string;
  targetChannelId?: number;
  sourceUserId?: number;
  timestamp: number;
  type: string;
  route: string;
  bodyParts: string[];

  constructor(
    client: WOLF,
    entity: any
  );

  getUser(): Promise<User|null>;
  getChannel(): Promise<Channel|null>;
  sendReply(content: string | buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  sendPrivateReply(content: string | buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  getPhrase(language: string, name?: string): string;
  hasCapability(capability: ChannelMemberCapability, checkStaff?: boolean, checkAuthorised?: boolean): Promise<boolean>;
  hasPrivilege(privilege: UserPrivilege|UserPrivilege[], requireAll?: boolean): Promise<boolean>;  
  
  constructor(client: WOLF);
}

export class Contact extends BaseEntity {
  id: number;
  additionalInfo: ContactAdditionalInfo;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class ContactAdditionalInfo extends BaseEntity {
  nicknameShort: string;
  onlineState: any;
  hash: string;
  privileges: any;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class CurrentUser extends User {
  constructor(
    client: WOLF,
    entity: any
  );
}

export class EndpointConfig extends BaseEntity {
  avatarEndpoint: string;
  mmsUploadEndpoint: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Event extends BaseEntity {
  id: number;
  attendanceCount: number;
  category: string;
  createdBy: number;
  endsAt: Date;
  groupId: number;
  hostedBy: number;
  imageUrl: string;
  isRemoved: boolean;
  longDescription: string;
  shortDescription: string;
  startsAt: Date;
  title: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class EventSubscription extends BaseEntity {
  id: number;
  groupId: number;
  additionalInfo: EventSubscriptionAdditionalInfo;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class EventSubscriptionAdditionalInfo extends BaseEntity {
  eTag: string;
  endsAt: Date;
  startsAt: Date;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class IconInfo extends BaseEntity {
  targetType: string;
  availableSizes: Record<string, string>;
  availableTypes: Set<string>;
  targetId?: number;

  constructor(
    client: WOLF,
    entity: any,
    targetType: string
  );

  get(size: string): string;
}

export class IdHash extends BaseEntity {
  id: number;
  hash: string;
  isChannel: boolean;

  constructor(
    client: WOLF,
    entity: any,
    isChannel?: boolean
  );
}

export class Link extends BaseEntity {
  start: number;
  end: number;
  link: string;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class Message extends BaseEntity {
  id: number;
  flightId: string;
  sourceUserId: number | null;
  targetChannelId: number | null;
  isChannel: boolean;
  timestamp: number;
  mimeType: string;
  body: string;
  metadata: MessageMetadata | null;
  edited: MessageEdited | null;
  isCommand: boolean;
  bodyParts: string[];

  constructor(
    client: WOLF,
    entity: any
  );

  getUser(): Promise<User|null>;
  getChannel(): Promise<Channel|null>;
  tip(tipCharms: any): Promise<WOLFResponse>;
  sendReply(content: string | buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  delete(): Promise<any>;
  restore(): Promise<any>;  
  
  constructor(client: WOLF);
}

export class MessageEdited extends BaseEntity {
  userId: number;
  timestamp: number;

  constructor(
    client: WOLF,
    entity: any
  );
}

export class MessageMetadataFormattingChannelLink extends BaseEntity {
  start: number;
  end: number;
  channelId: number | null;

  constructor(client: WOLF, entity: any);
}

export class MessageMetadataFormattingUrl extends BaseEntity {
  start: number;
  end: number;
  url: string;

  constructor(client: WOLF, entity: any);
}

export class MessageMetadataFormatting extends BaseEntity {
  channelLinks: MessageMetadataFormattingChannelLink[] | null;
  links: MessageMetadataFormattingUrl[] | null;

  constructor(client: WOLF, entity: any);
}

export class MessageMetadata extends BaseEntity {
  formatting: MessageMetadataFormatting | null;
  isDeleted: boolean;
  isEdited: boolean;
  isSpam: boolean;
  isTipped: boolean;

  constructor(client: WOLF, entity: any);
}

export class MessageSend {
  uuid: string;
  timestamp: number;
  slowModeInSeconds: number | null;

  constructor(client: WOLF, entity: any);
}

export class MessageUpdate {
  sourceUserId: number | null;
  targetChannelId: number | null;
  isChannel: boolean;
  timestamp: number;
  body: string;
  metadata: MessageMetadata | null;
  edited: MessageEdited | null;
  isCommand: boolean;

  constructor(client: WOLF, entity: any);
}

export class Metadata extends BaseEntity {
  imageUrl: string;
  description: string;
  domain: string;
  imageSize: number;
  isOfficial: boolean;
  title: string;

  constructor(client: WOLF, entity: any);
}

export class NotificationAdditionalInfo extends BaseEntity {
  createdAt: Date;
  eTag: string;

  constructor(client: WOLF, entity: any);
}

export class Notification extends BaseEntity {
  id: number;
  additionalInfo: NotificationAdditionalInfo;

  constructor(client: WOLF, entity: any);
}

export class NotificationGlobalFeed extends BaseEntity {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string;
  link: string;

  constructor(client: WOLF, entity: any);
}

export class NotificationGlobalPopup extends BaseEntity {
  title: string;
  languageId: Language;
  body: string;
  imageUrl: string;
  link: string;
  dismissText: string;
  linkText: string;
  priority: number;

  constructor(client: WOLF, entity: any);
}

export class NotificationGlobal extends BaseEntity {
  context: any;
  createdAt: Date;
  expiresAt: Date;
  feed?: NotificationGlobalFeed;
  popup?: NotificationGlobalPopup;
  id: number;
  notificationId: number;
  presentationType: any;
  typeId: number;

  constructor(client: WOLF, entity: any);
}

export class NotificationUserFeed extends BaseEntity {
  languageId: Language;
  title: string;
  body: string;
  imageUrl: string;
  link: string;

  constructor(client: WOLF, entity: any);
}

export class NotificationUserPopup extends BaseEntity {
  title: string;
  languageId: Language;
  body: string;
  imageUrl: string;
  link: string;
  dismissText: string;
  linkText: string;
  priority: number;

  constructor(client: WOLF, entity: any);
}

export class NotificationUser extends BaseEntity {
  context: any;
  createdAt: Date;
  expiresAt: Date;
  feed?: NotificationUserFeed;
  popup?: NotificationUserPopup;
  id: number;
  notificationId: number;
  presentationType: any;
  typeId: number;

  constructor(client: WOLF, entity: any);
}

export class Role extends BaseEntity {
  id: number;
  languageId: Language;
  description: string;
  emojiUrl: string;
  name: string;
  hexColur: string;

  constructor(client: WOLF, entity: any);
}

export class Search extends BaseEntity {
  id: number;
  hash: string;
  type: string;
  reason: string;

  constructor(client: WOLF, entity: any);
}

export class StoreProduct extends BaseEntity {
  id: number;
  languageId: Language;
  name: string;
  targetType: string;
  imageUrl: string;
  credits: number;
  reputationLevel: number;
  promotionText: string;
  isLimited: boolean;
  botId?: number;
  charmId?: number;
  profile?: StoreProductProfile;

  constructor(client: WOLF, entity: any);
}

export class StoreProductDuration extends BaseEntity {
  id: number;
  credits: number;
  days: number;

  constructor(client: WOLF, entity: any);
}

export class StoreProductImage extends BaseEntity {
  url: string;

  constructor(client: WOLF, entity: any);
}

export class StoreProductProfile extends BaseEntity {
  id: number;
  languageId: Language;
  name: string;
  description: string;
  heroImageUrl: string;
  webContentUrl: string;
  typeId: number;
  targetType: string;
  userLevel: number;
  reputationLevel: number;
  isStocked: boolean;
  isLimited: boolean;
  isPremium: boolean;
  isRemoved: boolean;
  durationList: Set<StoreProductDuration>;
  imageList: Set<StoreProductImage>;
  extraInfo: any;
  recipeId: number;

  constructor(client: WOLF, entity: any);
}

export class TimerJob {
  client: WOLF;
  handler: string | undefined;
  data: any;
  delay: number | undefined;
  timestamp: number | undefined;
  id: string | undefined;
  remaining: number | undefined;

  constructor(client: WOLF, job: any);

  cancel(): Promise<any>;
  delay(delay: number): Promise<any>;  
  
  constructor(client: WOLF);
}

export class TipContext {
  type: string;
  id: any | null;

  constructor(type: string, id?: any);
}

export class TipCharm extends BaseEntity {
  id: any;
  quantity: number | null;
  charmId: any | null;
  credits: any | null;
  magnitude: any | null;
  user: IdHash | null;

  constructor(client: WOLF, entity: any);
}

export class Tip extends BaseEntity {
  charmList: TipCharm[];
  channelId: any;
  isChannel: boolean;
  sourceUserId: any;
  userId: number;
  context: TipContext;
  version: number;

  constructor(client: WOLF, entity: any);
}

export class TipDetail extends BaseEntity {
  id: number;
  list: Set<TipCharm>;
  version: number;

  constructor(client: WOLF, entity: any);
}

export class TipLeaderboardItem extends BaseEntity {
  rank: number;
  charmId: number;
  quantity: number;
  credits: number;
  channel: IdHash | null;
  user: IdHash | null;

  constructor(client: WOLF, entity: any);
}

export class TipLeaderboard extends BaseEntity {
  leaderboard: Set<TipLeaderboardItem>;

  constructor(client: WOLF, entity: any);
}

export class TipLeaderboardSummary extends BaseEntity {
  topGifters: Set<IdHash>;
  topChannels: Set<IdHash>;
  topSpenders: Set<IdHash>;

  constructor(client: WOLF, entity: any);
}

export class TipSummary {
  id: number;
  list: Set<TipCharm>;
  version: number;

  constructor(client: WOLF, entity: any);
}

export class TopicPage {
  name: string;
  languageId: Language;
  id: number;
  title: string;
  showBalance: boolean;
  sectionList: Map<string, Set<any>>;

  constructor(client: WOLF, entity: any);
}

export class TopicPageSection {
  id: number;
  validity: TopicPageSectionValidity | null;
  colour: TopicPageSectionColour | null;
  elementList: TopicPageSectionElement[];

  constructor(client: WOLF, entity: any, languageId: Language);
}

// TopicPageSectionColour
export class TopicPageSectionColour {
  background: string | null;
  hasLightContent: boolean;

  constructor(client: WOLF, entity: any);
}

export class TopicPageSectionElement {
  onInvalid: any | null;
  properties: any | null;
  type: string;

  constructor(client: WOLF, entity: any, languageId: Language);
}

// TopicPageSectionElementProperties
export class TopicPageSectionElementProperties {
  type: string;
  onInvalid: any | null;
  size: any | null;
  style: any | null;
  context: any | null;
  refreshSeconds: number | null;
  text: string | null;
  aspect: any | null;
  recipe: any | null;
  link: any | null;
  heading: string | null;
  subHeading: string | null;
  body: string | null;
  imageUrl: string | null;

  constructor(client: WOLF, entity: any, languageId: Language);
}

export class TopicPageSectionElementPropertyAspect {
  width: number | null;
  height: number | null;

  constructor(client: WOLF, entity: any);
}

export class TopicPageSectionElementPropertyLink {
  text: string | null;
  url: string | null;

  constructor(client: WOLF, entity: any);
}

export class TopicPageSectionElementPropertyRecipe {
  id: any | null;
  min: number | null;
  max: number | null;
  languageId: Language;
  type: string;

  constructor(client: WOLF, entity: any, type: string, languageId: Language);
}

export class TopicPageSectionValidity {
  endTime: Date | null;
  fromTime: Date | null;

  constructor(client: WOLF, entity: any);
}

export class TopicRecipe {
  recipeId: any;
  id: any;
  languageId: Language;
  additionalInfo: any;
  type: any;

  constructor(client: WOLF, entity: any, type: any);
  get(): Promise<any>;  
  
  constructor(client: WOLF);
}

export class TopicRecipeAdditionalInfo {
  hash: string;

  constructor(client: WOLF, entity: any);
}

export class User {
  id: any;
  categoryIds: any[];
  charms: any;
  extended: any | null;
  followable: boolean;
  hash: string;
  icon: string;
  iconHash: string;
  iconInfo: any | null;
  nickname: string;
  privileges: number;
  privilegeList: number[];
  reputation: number;
  status: any;
  language: string;

  constructor(client: WOLF, entity: any);

  follow(): Promise<WOLFResponse>;
  unfollow(): Promise<WOLFResponse>;
  getFollowerCount(): Promise<number>;
  getFollowingCount(): Promise<number>;
  getAchievements(parentId: any, opts?: any): Promise<AchievementUser[]>;
  getCharmSummary(opts?: any): Promise<CharmSummary[]>;
  getCharmStatistics(opts?: any): Promise<CharmStatistic>;
  getPresence(opts?: any): Promise<UserPresence|null>;
  getWOLFStarsProfile(opts?: any): Promise<WOLFStar|null>;
  sendPrivateMessage(content: string | buffer, opts?: MessageSendOptions): Promise<WOLFResponse<MessageSend>>;
  getRoles(opts?: any): Promise<UserRole[]>;  
  
  constructor(client: WOLF);
}

export class UserExtended {
  about: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  language: string | null;
  lookingFor: string | null;
  urls: Set<string>;

  constructor(client: WOLF, entity: any);
}

export class UserFollow {
  userId: any;
  notification: boolean;
  hash: string;

  constructor(client: WOLF, entity: any);
  unfollow(): Promise<WOLFResponse>;
  toggleNotification(): Promise<WOLFResponse>;  
  
  constructor(client: WOLF);
}

export class UserFollower {
  followerId: any;
  hash: string;

  constructor(client: WOLF, entity: any);
}

export class UserPresence {
  userId: number;
  state: OnlineState;
  device: DeviceType;
  lastActive: any | null;
  subscribed: boolean;

  constructor(client: WOLF, entity: any, subscribed?: boolean);
}

export class UserRole {
  roleId: number;
  channelIdList: Set<number>;

  constructor(client: WOLF, entity: any);
}

export class UserSelectedCharm {
  charmId: number;
  position: number;

  constructor(client: WOLF, entity: any);
}

// UserSelectedCharmList
export class UserSelectedCharmList {
  selectedList: UserSelectedCharm[];

  constructor(client: WOLF, entity: any);
}

export class Welcome {
  ip: string;
  country: string;
  loggedInUser: any;
  isLoggedIn: boolean;
  token: string;
  endpointConfig: any;

  constructor(client: WOLF, entity: any);
}

export class WOLFResponse {
  code: number;
  body?: any;
  headers?: Map<string, string>;

  constructor(entity: any);
  get success(): boolean;
}

export class WOLFStar {
  userId: number;
  shows: any[];
  maxListeners: number;
  totalListeners: number;
  talentList: WOLFStarTalent[];

  constructor(client: WOLF, entity: any);
}


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
  /**
   * V3 Session Token (Automatically generated if none is provided)
   */
  token?: string;
  /**
   * Online State to show
   */
  onlineState?: OnlineState ;
  /**
   * The log in type, email, facebook, snapchat, etc
   */
  type?: string;
}

export interface CommandOptions {
  key: string;
  callbackObject: CommandCallbackMap;
  children?: Command[];
}

export type {
  Command,
  CommandCallback,
  CommandCallbackMap,
  CommandManager,
  Achievement,
  AchievementCategory,
  AchievementCategoryOptions,
  AchievementChannel,
  AchievementChannelAdditionalInfo,
  AchievementChannelOptions,
  AchievementOptions,
  AchievementUser,
  AchievementUserAdditionalInfo,
  AchievementUserOptions,
  Ad,
  AdminAction,
  AudioChannelListOptions,
  Avatar,
  AvatarType,
  BaseExpireProperty,
  BaseEntity,
  BaseOptions,
  Blacklist,
  BaseStore,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
  ChannelHub,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelVerificationTier,
  ContextType,
  Channel,
  ChannelAudioConfig,
  ChannelAudioCount,
  ChannelAudioSlot,
  ChannelAudioSlotConnectionState,
  ChannelAudioSlotRequest,
  ChannelAudioSlotRequestOptions,
  ChannelAudioSlotReservation,
  ChannelCategory,
  ChannelCategoryOptions,
  ChannelEntities,
  ChannelEntityOptions,
  ChannelEvent,
  ChannelEventAdditionalInfo,
  ChannelEventType,
  ChannelExtended,
  ChannelListOptions,
  ChannelMember,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelMessageConfig,
  ChannelOptions,
  ChannelOwner,
  ChannelRole,
  ChannelRoleOptions,
  ChannelRoleUser,
  ChannelRoleUserOptions,
  ChannelStage,
  ChannelStats,
  ChannelStatsDetails,
  ChannelStatsOptions,
  ChannelStatsOwner,
  ChannelStatsTop,
  ChannelStatsTrend,
  ChannelVerificationTier,
  Charm,
  CharmActive,
  CharmExpired,
  CharmOptions,
  CharmStatistic,
  CharmStatisticExtended,
  CharmSummary,
  CharmUserStatisticsOptions,
  CharmUserSummaryOptions,
  Cognito,
  CommandContext,
  Contact,
  ContactAdditionalInfo,
  ContactOptions,
  ContextType,
  CurrentUser,
  DeviceType,
  defaultChannelEntities,
  EmbedType,
  EndpointConfig,
  Event,
  EventChannelOptions,
  EventOptions,
  EventSubscription,
  EventSubscriptionAdditionalInfo,
  EventSubscriptionOptions,
  ExtendedUserOptions,
  Gender,
  IconSize,
  IconSize,
  IdHash,
  Language,
  LoginType,
  LookingFor,
  Language,
  Link,
  LoginOptions,
  LoginType,
  LookingFor,
  MessageFilterTierLevel,
  MessageSendOptions,
  MessageType,
  Message,
  MessageEdited,
  MessageMetadata,
  MessageMetadataFormatting,
  MessageMetadataFormattingChannelLink,
  MessageMetadataFormattingUrl,
  MessageSendOptions,
  MessageSend,
  MessageUpdate,
  Metadata,
  Notification,
  NotificationAdditionalInfo,
  NotificationGlobal,
  NotificationGlobalFeed,
  NotificationGlobalPopup,
  NotificationOptions,
  NotificationUser,
  NotificationUserFeed,
  NotificationUserPopup,
  Relationship,
  Role,
  RoleOptions,
  Search,
  SecurityTokenOptions,
  StageSlotOptions,
  StoreProduct,
  StoreProductDuration,
  StoreProductImage,
  StoreProductOptions,
  StoreProductProfile,
  StoreProductProfileOptions,
  TipDirection,
  TipPeriod,
  TipType,
  TopicPageRecipeType,
  TimerJob,
  Tip,
  TipCharm,
  TipContext,
  TipDetail,
  TipDirection,
  TipLeaderboard,
  TipLeaderboardItem,
  TipLeaderboardSummary,
  TipSummary,
  TopicPage,
  TopicPageRecipeType,
  TopicPageSectionColour,
  TopicPageSectionElement,
  TopicPageSectionElementProperties,
  TopicPageSectionElementPropertyAspect,
  TopicPageSectionElementPropertyLink,
  TopicPageSectionElementPropertyRecipe,
  TopicPageSectionValidity,
  TopicRecipe,
  TopicRecipeAdditionalInfo,
  UserFollowerType,
  UserPrivilege,
  User,
  UserExtended,
  UserFollow,
  UserFollower,
  UserFollowerType,
  UserOptions,
  UserPresence,
  UserPresenceOptions,
  OnlineState,
  UserPrivilege,
  UserRole,
  UserRoleOptions,
  UserSelectedCharm,
  UserSelectedCharmList,
  WOLF,
  WOLFStarTalent,
  WOLFResponse,
  WOLFStar,
  WOLFStarOptions,
};
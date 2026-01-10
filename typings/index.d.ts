
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

<<<<<<< HEAD
    /**
     * Login to WOLF using credentials stored in configuration
     */
    public login(): void;
    /**
     * Login to WOLF
     * @param email - The email belonging to the account
     * @param password - The password belonging to the account
     * @param apiKey - The provided Bot APIKEY
     * @param onlineState - The onlineState to appear as (Default: Online)
     * @param loginType - The loginType (Default: Email)
     */
    public login(email: string, password: string, apiKey?: string, onlineState?: OnlineState, loginType?: LoginType): Promise<void>;
=======
  /** @internal */
  protected patch(newData: Record<string, any>, oldData?: Record<string, any> | null): void;
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82

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

<<<<<<< HEAD
    readonly channels: Channel[];
    /**
     * Exposes the Channel Member methods
     */
    readonly member: ChannelMemberHelper;

    /**
     * Exposes the Channel Role methods
     * @deprecated use {@link WOLF.role} instead
     */
    readonly role: ChannelRoleHelperDeprecated;

    /**
     * Get list of joined channels
     */
    public list(): Promise<Array<Channel>>;
    /**
     * Get a channel profile
     * @param id - The ID of the channel
     * @param subscribe - Whether or not to subscribe to profile updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, subscribe?: boolean, forceNew?: boolean): Promise<Channel>;
    /**
     * Get channels profiles
     * @param ids - The list of channel IDs
     * @param subscribe - Whether or not to subscribe to profile updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, subscribe?: boolean, forceNew?: boolean): Promise<Channel | Array<Channel>>;
    /**
     * Get a channel
     * @param name - The name of the channel
     * @param subscribe - Whether or not to subscribe to profile updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getByName(name: string, subscribe?: boolean, forceNew?: boolean): Promise<Channel>;
    /**
     * Update a channel profile
     * @param id - The ID of the channel
     * @param channelData - The new channel data
     */
    public update(id: number, channelData: { description?: string, peekable?: boolean, disableHyperlink?: boolean, disableImage?: boolean, disableImageFilter?: boolean, disableVoice?: boolean, slowModeRateInSeconds?: number, longDescription?: string, discoverable?: boolean, language?: Language, category?: Category, advancedAdmin?: boolean, questionable?: boolean, locked?: boolean, closed?: boolean, entryLevel?: number, avatar: Buffer }): Promise<Response>;
    /**
     * Join a channel
     * @param id - The ID of the channel
     * @param password - The password
     */
    public joinById(id: number, password?: string): Promise<Response>;
    /**
     * Join a channel
     * @param name - The name of the channel
     * @param password - The password
     */
    public joinByName(name: string, password?: string): Promise<Response>;
    /**
     * Leave a channel
     * @param id - The ID of the channel
     */
    public leaveById(id: number): Promise<Response>;
    /**
     * Leave a channel
     * @param name - The name of the channel
     */
    public leaveByName(name: string): Promise<Response>;
    /**
     * Get chat history
     * @param id - The ID of the channel
     * @param chronological - Whether or not the messages should be in order
     * @param timestamp - The timestamp to start at
     * @param limit - How many messages to request (Default: 15)
     */
    public getChatHistory(id: number, chronological?: boolean, timestamp?: number, limit?: number): Promise<Array<Message>>;
    /**
     * Get stats
     * @param id - The ID of the channel
     */
    public getStats(id: number): Promise<ChannelStats>;
    /**
     * Get channel recommendations based on bot activity
     */
    public getRecommendationList(): Promise<Array<Channel>>;
    /**
     * Search for a channel
     * @param query - The search params
     */
    public search(query: string): Promise<Array<Search>>;
}

export class ChannelMemberHelper extends BaseHelper {
    private constructor(client);
    /**
     * Get list of bots in the channel
     * @param targetChannelId - The ID of the channel
     * @param returnCurrentList - Whether or not to return the currently fetched list
     */
    public getList(targetChannelId: number, list: MemberListType, returnCurrentList?: boolean): Promise<Array<ChannelMember>>;
    /**
     * Get list of bots in the channel
     * @param targetChannelId - The ID of the channel
     * @param returnCurrentList - Whether or not to return the currently fetched list
     */
    public getMember(targetChannelId: number, subscriberId: number): Promise<ChannelMember>;

    /**
     * Get list of bots in the channel
     * @param targetChannelId - The ID of the channel
     * @param returnCurrentList - Whether or not to return the currently fetched list
     */
    public getBotList(targetChannelId: number, returnCurrentList?: boolean): Promise<Array<ChannelMember>>;
    /**
     * Get a channels silenced list
     * @param targetChannelId - The ID of the channel
     * @param returnCurrentList - Whether or not to return the currently fetched list
     */
    public getSilencedList(targetChannelId: number, returnCurrentList?: boolean): Promise<Array<ChannelMember>>;
    /**
     * Get a channels banned list (Mod required)
     * @param targetChannelId - The ID of the channel
     * @param limit - How many should be returned (Default: 100)
     */
    public getBannedList(targetChannelId: number, limit?: number): Promise<Array<ChannelMember>>;
    /**
     * Get a channels privileged list
     * @param targetChannelId - The ID of the channel
     */
    public getPrivilegedList(targetChannelId: number): Promise<Array<ChannelMember>>;
    /**
     * Get a channels regular list
     * -- NOT BOT FRIENDLY, BATCHES OF 100 --
     * @param targetChannelId - The ID of the channel
     * @param returnCurrentList - Whether or not to return the currently fetched list
     */
    public getRegularList(targetChannelId: number, returnCurrentList?: boolean): Promise<Array<ChannelMember>>;
    /**
     * Get a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public get(targetChannelId: number, subscriberId: number): Promise<ChannelMember>;

    /**
     * Coowner a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public coowner(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Admin a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public admin(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Mod a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public mod(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Reset a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public regular(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Silence a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public silence(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Ban a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public ban(targetChannelId: number, subscriberId: number): Promise<Response>;
    /**
     * Kick a subscriber
     * @param targetChannelId - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     */
    public kick(targetChannelId: number, subscriberId: number): Promise<Response>;
=======
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
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82
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
<<<<<<< HEAD
    private constructor(client);

    /**
     * Get a topic page
     * @param name - The page name
     * @param languageId - The language to request in
     */
    public getTopicPageLayout(name: string, languageId: Language): Promise<Response<object>>;
    /**
     * Get a topic page recipe list
     * @param id - The recipe ID
     * @param languageId - The language to request in
     * @param maxResults - How many items should be returned
     * @param offset - Where the request should start at (Default: 0)
     * @param type - The type of recipe
     */
    public getTopicPageRecipeList(id: number, languageId: Language, maxResults: number, offset: number, type: TopicPageRecipeType): Promise<Response<Array<object>>>;
}
//#endregion

//#region Utilities
export class ArrayUtility {
    /**
     * Chunk an array
     * @param array - The array
     * @param length - The length of each chunk
     */
    chunk(array: Array<any>, length: number): Array<Array<any>>;
    /**
     * Shuffle an array
     * @param array - The array
     */
    shuffle(array: Array<any>): Array<any>;
    /**
     * Get random item(s) from an array
     * @param array - The array
     * @param amount - How many items should be returned (Default: 1)
     */
    getRandom(array: Array<any>, amount?: number): any;
    /**
     * Join multiple arrays
     * @param arrays - The arrays
     */
    join(arrays: Array<Array<any>>): Array<any>;
    /**
     * Reverse the order of an array
     * @param array - The array
     */
    reverse(array: Array<any>): Array<any>;
    /**
     * Take nth items from the start of an array
     * @param array - The array
     * @param length - How many items to take
     */
    take(array: Array<any>, length: number): Array<any>;
    /**
     * Check whether an object exists in an array
     * @param array - The array
     * @param object - The object
     */
    includes(array: Array<any>, object: any): any;
}

export class ChannelUtility {
    private constructor(client: WOLF);

    /**
     * Exposes the ChannelMember utility methods
     */
    readonly member: ChannelMemberUtility;
    /**
     * Get a channels avatar
     * @param channelId - The ID of the channel
     * @param size - The size to request
     */
    public avatar(channelId: number, size: IconSize): Buffer;
}

export class ChannelMemberUtility {
    private constructor(client: WOLF);

    /**
     * Check if a subscriber has a capability in channel
     * @param targetChannelId - The ID of the channel
     * @param targetSubscriberId - The ID of the subscriber
     * @param capability - The minimum capability required
     * @param checkStaff - Check if user is staff (Bypasses capability)
     * @param checkAuthorized - Check if user is authorized (Bypasses capability)
     */
    public hasCapability(targetChannelId: number, targetSubscriberId: number, capability: Capability, checkStaff?: boolean, checkAuthorized?: boolean): Promise<boolean>
}

export class NumberUtility {
    /**
     * Convert a number or string to english numbers
     * @param arg - The number or string
     */
    public toEnglishNumbers(arg: number | string): number | string;
    /**
     * Convert a number or string to arabic numbers
     * @param arg - The number or string
     */
    public toArabicNumbers(arg: number | string): number | string;
    /**
     * Convert a number or string to persian numbers
     * @param arg - The number or string
     */
    public toPersianNumbers(arg: number | string): number | string;
    /**
     * Add commas
     * @param arg - The number or string
     */
    public addCommas(arg: number | string): number | string;
    /**
     * Get a random number between to number
     * @param min - The minimum number
     * @param max - The maximum number
     */
    public random(min: number, max: number): number;
    /**
     * Clamp a number between a range
     * @param number - The number
     * @param lower - The minimum number allowed
     * @param upper - The maximum number allowed
     */
    public clamp(number: number, lower: number, upper: number): number;
}

export class StringUtility {
    private constructor(client: WOLF);

    /**
     * Replace placeholders in a string
     * @param string - The string
     * @param replacements - The object of replacements
     */
    public replace(string: string, replacements: { [key: string]: string | number }): string;
    /**
     * Check if two strings are equal
     * @param sideA - String A
     * @param sideB - String B
     */
    public isEqual(sideA: string, sideB: string): boolean;
    /**
     * Chunk a string
     * @param string - The string
     * @param length - The length of the chunk
     * @param splitChar - The character to split at
     * @param joinChar - The character to join at
     */
    public chunk(string: string, length?: string, splitChar?: string, joinChar?: string): Array<string>;
    /**
     * Trim all ads from a string
     * @param string - The string
     */
    public trimAds(string: string): string;
    /**
     * Get all links in a string
     * @param string - The string
     */
    public getLinks(string: string): Array<Link>;
    /**
     * Get all ads in a string
     * @param string - The string
     */
    public getAds(string: string): Array<Ad>;
    /**
     * Replaces all accented letters with non-accented letters
     * @param string - The string
     */
    public sanitise(string: string): string;
}

export class SubscriberUtility {
    private constructor(client: WOLF);

    /**
     * Exposes the Subscriber Privilege utility methods
     */
    readonly privilege: SubscriberPrivilegeUtility;
    /**
     * Get a subscriber avatar
     * @param subscriberId - The ID of the subscriber
     * @param size - The size to request
     */
    public avatar(subscriberId: number, size: IconSize): Buffer;
}

export class SubscriberPrivilegeUtility {
    private constructor(client: WOLF);

    /**
     * Check if a subscriber has a list of privileges
     * @param subscriberId - The ID of the subscriber
     * @param privileges - The privilege or privileges
     * @param requireAll - Whether or not the subscriber should have all of the provided privileges
     */
    public has(subscriberId: number, privileges: Privilege | Array<Privilege>, requireAll?: boolean): Promise<boolean>
}

export class TimerUtility {
    /**
     * Initialise the timer utility
     * @param handlers - The handlers
     */
    public register(handlers: { [key: string]: Function },): Promise<void>;
    /**
     * Create an event timer
     * @param name - The name of the event
     * @param handler - The handler
     * @param data - The timer data
     * @param duration - The time until the timer ends
     */
    public add(name: string, handler: string, data: object, duration: number): Promise<TimerJob>;
    /**
     * Cancel an event timer
     * @param name - The name of the event
     */
    public cancel(name: string): Promise<TimerJob>;
    /**
     * Get an event timer
     * @param name - The name of the event
     */
    public get(name: string): Promise<TimerJob>;
    /**
     * Change when the event should fire
     * @param name - The name of the event
     * @param duration - The new event duration
     */
    public delay(name: string, duration: Number): Promise<TimerJob>;
}

export class Utility {
    private constructor(client: WOLF);

    /**
     * Exposes the Array utility methods
     */
    readonly array: ArrayUtility;
    /**
     * Exposes the Channel utility methods
     */
    readonly channel: ChannelUtility;
    /**
     * Exposes the Group utility methods
     * @deprecated use {@link channel} instead
     */
    readonly group: ChannelUtility;
    /**
     * Exposes the Number utility methods
     */
    readonly number: NumberUtility;
    /**
     * Exposes the String utility methods
     */
    readonly string: StringUtility;
    /**
     * Exposes the Subscriber utility methods
     */
    readonly subscriber: SubscriberUtility;
    /**
     * Exposes the Timer utility methods
     */
    readonly timer: TimerUtility;
    /**
     * Join a channel
     * @param command - The command
     * @param onPermissionErrorCallback - An override method to be called if a permission check fails (Default: undefined)
     */
    public join(command: CommandContext, onPermissionErrorCallback: Function | undefined): Promise<MessageResponse>;
    /**
     * Leave a channel
     * @param command - The command
     * @param onPermissionErrorCallback - An override method to be called if a permission check fails (Default: undefined)
     */
    public leave(command: CommandContext, onPermissionErrorCallback: Function | undefined): Promise<MessageResponse>;
    /**
     * Download data from a url
     * @param url - The URL
     */
    public download(url: string): Promise<Buffer>;
    /**
     * Convert string language to LanguageID
     * @param languageKey - The language ISO
     */
    public toLanguageId(languageKey: string): Language;
    /**
     * Convert LanguageID to string language
     * @param languageId - The language ID
     */
    public toLanguageKey(languageId: Language): string;
    /**
     * Delay a method
     * @param time - How long to wait
     * @param type - Time type to wait in
     */
    public delay(time: number, type?: 'milliseconds' | 'seconds'): Promise<void>
    /**
     * Convert a number to a readable time format
     * @param language - The language
     * @param time - The time
     * @param type - Time type
     */
    public toReadableTime(language: string, time: number, type?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): string;

}

export namespace Validator {

    export function isType(arg: any, type: 'String' | 'Undefined' | 'Null' | 'Boolean' | 'Number' | 'BigInt' | 'Function' | 'Object'): boolean;
    export function isNull(arg: any): boolean;
    export function isNullOrUndefined(arg: any): boolean;
    export function isNullOrWhitespace(arg: String): Boolean;
    export function isLessThanOrEqualZero(arg: Number): Boolean;
    export function isLessThanZero(arg: Number): Boolean;
    export function isGreaterThanOrEqualZero(arg: Number): Boolean;
    export function isGreaterThanZero(arg: Number): Boolean;
    export function isValidNumber(arg: String | Number, acceptDecimals?: Boolean): Boolean;
    export function isValidBoolean(arg: Number | Boolean): Boolean
    export function isValidDate(arg: Date | Number): Boolean;
    export function isValidHex(arg: string): Boolean;
    export function isValidEmoji(arg: string): Boolean;
    export function isValidUrl(client: WOLF, arg: String): Boolean
}


//#endregion

//#region Builders

export class CharmSelectedBuilder {
    public constructor(charmId: number, position: number);

    public charmId: number;
    public position: number
}

//#endregion

//#region Models

export class BaseModel {
    public constructor(client: WOLF);

    /**
     * Converts the current class to a stringifiable object
     */
    toJSON(): any;
}

export class Achievement extends BaseModel {
    private constructor(client: WOLF, data: object);

    public id: number;
    public parentId: number;
    public typeId: number;
    public name: string;
    public description: string;
    public imageUrl: string;
    public category: number;
    public levelId: number;
    public levelName: string;
    public acquisitionPercentage: number;
    public exists: boolean;

    toJSON(): {
        id: number;
        parentId: number;
        typeId: number;
        name: string;
        description: string;
        imageUrl: string;
        category: number;
        levelId: number;
        levelName: string;
        acquisitionPercentage: number;
        exists: boolean;
    };
}

export class AchievementCategory extends BaseModel {
    private constructor(client: WOLF, data: object);

    public id: number;
    public name: string;

    toJSON(): {
        id: number;
        name: string;
    };
}

export class AchievementUnlockable extends BaseModel {
    private constructor(client: WOLF, data: object);

    public id: number;
    public additionalInfo: AchievementUnlockableAdditionalInfo;

    /**
     * Get the achievement
     */
    public achievement(): Promise<Achievement>;

    toJSON(): {
        id: number,
        additionalInfo: {
            awardedAt: Date;
            eTag: string;
        }
    };
}

export class AchievementUnlockableAdditionalInfo extends BaseModel {
    private constructor(client: WOLF, data: object)

    public awardedAt: Date;
    public eTag: string;

    toJSON(): {
        awardedAt: Date;
        eTag: string;
    };
}

export class Ad extends BaseModel {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public ad: string;
    public channelName: string;

    /**
     * Get the group profile
     * @deprecated use {@link channel} instead
     */
    public group(): Promise<Channel>;
    /**
     * Get the channel profile
     */
    public channel(): Promise<Channel>;

    toJSON(): {
        start: number;
        end: number;
        ad: string;
        channelName: string;
    };
}

export class BlacklistLink extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public regex: string;

    toJSON(): {
        id: number,
        regex: string
    }
}

export class Charm extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public name: string;
    public productId: number;
    public imageUrl: string;
    public descriptionPhraseId: Number;
    public descriptionList: Array<any>;
    public nameTranslationList: Array<{ languageId: Language, text: string }>;
    public weight: number;
    public cost: number;
    public exist: boolean;

    toJSON(): {
        id: number;
        name: string;
        productId: number;
        imageUrl: string;
        descriptionPhraseId: Number;
        descriptionList: Array<any>;
        nameTranslationList: Array<{ languageId: Language, text: string }>;
        weight: number;
        cost: number;
        exist: boolean;
    };
}

export class CharmExpiry extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public charmId: number;
    public subscriberId: number;
    public sourceSubscriberId: number;
    public expireTime: Date;

    /**
     * Get the charm
     */
    public charm(): Promise<Charm>;
    /**
     * Set the charm on the bots profile
     */
    public set(): Promise<Response>;
    /**
     * Delete the charm from the list
     */
    public delete(): Promise<Response>;

    toJSON(): {
        id: number;
        charmId: number;
        subscriberId: number;
        sourceSubscriberId: number;
        expireTime: Date;
    };
}

export class CharmSelected extends BaseModel {
    private constructor(client: WOLF, data: object)

    public charmId: number;
    public position: number;

    /**
     * Get the charm
     */
    public charm(): Promise<Charm>;
    /**
     * Remove the selected charm
     */
    public deselect(): Promise<Response>;

    toJSON(): {
        charmId: number;
        position: number;
    };
}

export class CharmStatistics extends BaseModel {
    private constructor(client: WOLF, data: object)

    public subscriberId: number;
    public totalGiftedSent: number;
    public totalGiftedReceived: number;
    public totalLifetime: number;
    public totalActive: number;
    public totalExpired: number;

    toJSON(): {
        subscriberId: number;
        totalGiftedSent: number;
        totalGiftedReceived: number;
        totalLifetime: number;
        totalActive: number;
        totalExpired: number;
    };
}

export class CharmSummary extends BaseModel {
    private constructor(client: WOLF, data: object)

    public charmId: number;
    public total: number;
    public expireTime: Date;
    public giftCount: number;

    toJSON(): {
        charmId: number;
        total: number;
        expireTime: Date;
        giftCount: number;
    };
}

export class CommandContext extends BaseModel {
    private constructor(client: WOLF, data: object)

    /**
     * @deprecated use {@link isChannel} instead
     */
    public isGroup: boolean;
    public isChannel: boolean;
    public argument: string;
    public language: string;
    public targetChannelId: number | undefined;
    /**
     * @deprecated use {@link targetChannelId} instead
     */
    public targetGroupId: number | undefined;
    public sourceSubscriberId: number | undefined;
    public timestamp: number;
    public type: MessageType;
    public route: Array<PhraseRoute>

    /**
     * Gets the command subscriber
     */
    public subscriber(): Promise<Subscriber>;
    /**
     * Gets the command group
     * @deprecated used channel
     */
    public group(): Promise<Channel>;

    /**
     * Gets the command channel
     */
    public channel(): Promise<Channel>;

    /**
     * Reply to the command
     * @param content - The message
     * @param options - The send options
     */
    public reply(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    /**
     * Send the subscriber who used the command a private message
     * @param content - The message
     * @param options - The send options
     */
    public replyPrivate(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;

    /**
     * Check if a user has a capability
     * @param capability - The minimum capability to check
     * @param checkStaff - Whether or not to check if user is staff (Default: true)
     * @param checkAuthorized - Whether or not to check if a user is authorized (Default: true)
     */
    public hasCapability(capability: Capability, checkStaff?: boolean, checkAuthorized?: boolean): Promise<boolean>;

    /**
     * Check if a user has a privilege or privileges
     * @param privilege - The privilege or privileges to check
     * @param requireAll - Whether or not the subscriber should have them all
     */
    public hasPrivilege(privilege: Privilege | Array<Privilege>, requireAll?: boolean): Promise<boolean>;

    /**
     * Check if a user is authorized
     */
    public isAuthorized(): Promise<boolean>;

    /**
     * Get a phrase using the commands language
     * @param name - The phrase name
     */
    public getPhrase(name: string): string;

    /**
     * Get a phrase in a specific language
     * @param language - The language to get
     * @param name - The name of the phrase
     */
    public getPhrase(language: string, name: string): string;

    toJSON(): {
        isGroup: boolean;
        isChannel: boolean;
        argument: string;
        language: string;
        targetChannelId: number | undefined;
        targetGroupId: number | undefined;
        sourceSubscriberId: number | undefined;
        timestamp: number;
        type: MessageType;
    };
}

export class Contact extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public additionalInfo: ContactAdditionalInfo;

    /**
     * Add the subscriber to the bots blocked list
     */
    public block(): Promise<Response>;
    /**
     * Remove the subscriber from the bots blocked list
     */
    public unblock(): Promise<Response>;
    /**
     * Add the subscriber as a contact
     */
    public add(): Promise<Response>;
    /**
     * Delete the subscriber as a contact
     */
    public delete(): Promise<Response>;
    /**
     * Get the profile
     */
    public profile(): Promise<Subscriber>;

    toJSON(): {
        id: number,
        additionalInfo: {
            hash: number;
            nicknameShort: string;
            onlineState: OnlineState;
            privileges: Privilege;
            privilegeList: Array<Privilege>;
        }
    };
}

export class ContactAdditionalInfo extends BaseModel {
    private constructor(client: WOLF, data: object)

    public hash: number;
    public nicknameShort: string;
    public onlineState: OnlineState;
    public privileges: Privilege;
    public privilegeList: Array<Privilege>;

    toJSON(): {
        hash: number;
        nicknameShort: string;
        onlineState: OnlineState;
        privileges: Privilege;
        privilegeList: Array<Privilege>;
    };
}

export class Discovery extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<DiscoverySection>;

    /**
     * Get the page, product, event or channels
     * @param value - The page, name or ID
     * @param offset - The product, event or channel offset
     */
    public get(value: number | string, offset?: number): Promise<DiscoverySection | DiscoveryPage | Array<Channel | StoreProductPartial | Event | Subscriber>>;

    toJSON(): {
        id: number;
        title: string;
        languageId: Language;
        sections: Array<{
            id: number;
            languageId: Language;
            validity: {
                fromTime: Date;
                endTime: Date;
            };

            sectionTitle: string;
            title: string;
            images: Array<string>;
            description: string;
            videos: Array<{
                aspect: {
                    width: number;
                    height: number;
                };
                autoplay: boolean;
                loop: boolean;
                muted: boolean;
                url: string;
            }>;
            additionalDescriptions: Array<string>
        }>;
    };
}

export class DiscoveryPage extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<DiscoverySection>;

    /**
     * Get the page, product, event or channels
     * @param value - The page or ID
     * @param offset - The product, event or channel offset
     */
    public get(value: number | string, offset?: number): Promise<DiscoverySection | DiscoveryPage | Array<Channel | StoreProductPartial | Event | Subscriber>>;

    toJSON(): {
        id: number;
        title: string;
        languageId: Language;
        sections: Array<{

            id: number;
            languageId: Language;
            validity: {
                fromTime: Date;
                endTime: Date;
            };
            sectionTitle: string;
            title: string;
            images: Array<string>;
            description: string;
            videos: Array<{
                aspect: {
                    width: number;
                    height: number;
                };
                autoplay: boolean;
                loop: boolean;
                muted: boolean;
                url: string;
            }>;
            additionalDescriptions: Array<string>
        }
        >;
    };
}

export class DiscoverySection extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public languageId: Language;
    public validity: Validity;

    public sectionTitle: string;
    public title: string;
    public images: Array<string>;
    public description: string;
    public videos: Array<TopicSectionVideo>;
    public additionalDescriptions: Array<string>

    /**
     * Get the page, event, product or channels belonging to the section
     * @param offset - The Page, Event, Product or channel offset
     */
    public get(offset?: number): Promise<DiscoveryPage | Array<Channel> | Array<StoreProductPartial> | Array<Event>>;

    toJSON(): {
        id: number;
        languageId: Language;
        validity: {
            fromTime: Date;
            endTime: Date;
        };
        sectionTitle: string;
        title: string;
        images: Array<string>;
        description: string;
        videos: Array<{
            aspect: {
                width: number;
                height: number;
            };
            autoplay: boolean;
            loop: boolean;
            muted: boolean;
            url: string;
        }>;
        additionalDescriptions: Array<string>
    }
}

export class Event extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public channelId: number;
    /**
     * @deprecated use {@link channelId} instead
     */
    public groupId: number;
    public createdBy: number;
    public title: string;
    public category: EventCategory;
    public hostedBy: number;
    public shortDescription: string;
    public longDescription: string;
    public imageUrl: string;
    public startsAt: Date;
    public endsAt: Date;
    public isRemoved: boolean;
    public attendanceCount: number;

    /**
     * Add the event to the bots subscription list
     */
    public subscribe(): Promise<Response>;
    /**
     * Remove the event from the bots subscription list
     */
    public unsubscribe(): Promise<Response>;

    /**
     * Update the event profile
     * @param eventData - The new event data
     */
    public update(eventData: { title?: string, startsAt?: Date, category?: EventCategory, hostedBy?: number, shortDescription?: string, longDescription?: string, thumbnail?: Buffer }): Promise<Response>;
    /**
     * Update the event thumbnail
     * @param thumbnail - The thumbnail
     */
    public updateThumbnail(thumbnail: Buffer): Promise<Response>;

    toJSON(): {
        id: number;
        channelId: number;
        groupId: number;
        createdBy: number;
        title: string;
        category: EventCategory;
        hostedBy: number,
        shortDescription: string;
        longDescription: string;
        imageUrl: string;
        startsAt: Date;
        endsAt: Date;
        isRemoved: boolean;
        attendanceCount: number;
    };
}

export class Channel extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public hash: string;
    public name: string;
    public description: string;
    public reputation: number;
    public owner: IdHash;
    public membersCount: number;
    public official: boolean;
    public peekable: boolean;
    public premium: boolean;
    public icon: number;
    public iconInfo: IconInfo;
    public extended: ChannelExtended;
    public audioCounts: ChannelAudioCounts;
    public audioConfig: ChannelAudioConfig;
    public messageConfig: ChannelMessageConfig;
    public members: ChannelMemberManager;
    public verificationTier: VerificationTier;
    public roles: ChannelRoleContainer;

    /**
     * @deprecated use {@link inChannel} instead
     */
    public inGroup: boolean;
    public inChannel: boolean;
    public capabilities: Capability;
    public exists: boolean;

    public percentage: string;

    /**
     * Get the events fora channel
     * @param subscribe
     * @param forceNew
     */
    public events(subscribe?: boolean, forceNew?: boolean): Promise<Event>;
    /**
     * Get the channel avatar URL
     * @param size - The size
     */
    public getAvatarUrl(size: IconSize): string;
    /**
     * Get the channel avatar
     * @param size - The size
     */
    public getAvatar(size: IconSize): Promise<Buffer>;

    /**
     * Join the channel
     * @param password - The channels password if it has one
     */
    public join(password?: string | undefined): Promise<Response>;
    /**
     * Leave the channel
     */
    public leave(): Promise<Response>;
    /**
     * Get the channels stats
     */
    public stats(): Promise<ChannelStats>;
    /**
     * Get the channels audio slots
     */
    public slots(): Promise<Array<ChannelAudioSlot>>;

    /**
     * Send a message in the channel
     * @param content - The message
     * @param options - The send options
     */
    public sendMessage(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    /**
     * Update the channels profile
     * @param profileData - The new profile data
     */
    public update(profileData: { description?: string, peekable?: boolean, disableHyperlink?: boolean, disableImage?: boolean, disableImageFilter?: boolean, disableVoice?: boolean, slowModeRateInSeconds?: number, longDescription?: string, discoverable?: boolean, language?: Language, category?: Category, advancedAdmin?: boolean, questionable?: boolean, locked?: boolean, closed?: boolean, entryLevel?: number, avatar?: Buffer }): Promise<Response>;

    public stages(forceNew?: boolean): Promise<Array<ChannelStage>>;

    /**
     * Get the channels tip leaderboard summary
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping type
     * @param tipDirection - The tipping direction
     */
    public tipLeaderboardSummary(tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboardSummary>;

    /**
     * Get the channels tip leaderboard
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping types
     * @param tipDirection - The tipping direction
     */
    public tipLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboard>;

    toJSON(): {
        id: number;
        hash: string;
        name: string;
        description: string;
        reputation: number;
        owner: IdHash;
        membersCount: number;
        official: boolean;
        peekable: boolean;
        premium: boolean;
        icon: number;
        verificationTier: VerificationTier,
        iconInfo: {
            availableTypes: Array<Avatar>,
            availableSizes: {
                small: string;
                medium: string;
                large: string;
                xlarge: string;
            }
        };
        extended: {
            id: number;
            longDescription: string;
            discoverable: boolean;
            language: Language;
            category: Category;
            advancedAdmin: boolean;
            questionable: boolean;
            locked: boolean;
            closed: boolean;
            passworded: boolean;
            entryLevel: number;
        };
        audioCounts: {
            broadcasterCount: number;
            consumerCount: number;
            id: number;
        };
        audioConfig: {
            id: number;
            enabled: boolean;
            stageId: number | undefined;
            minRepLevel: number;
        };
        messageConfig: {
            disableHyperlink: boolean;
            disableImage: boolean;
            disableImageFilter: boolean;
            disableVoice: boolean;
            id: number;
            slowModeRateInSeconds: number;
        };
        members: {
            privileged: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
            regular: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
            silenced: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
            banned: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
            bots: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
            misc: Array<{
                id: number;
                hash: string;
                capabilities: Capability;
            }>
        };
        roles: {
            members: Array<{
                roleId: number,
                subscriberId: number
            }>,
            roles: Array<{
                roleId: number,
                subscriberIdsList: Array<number>,
                maxSeats: number
            }>
        },
        inGroup: boolean;
        inChannel: boolean;
        capabilities: Capability;
        exists: boolean;
        percentage: string;
    };
}

export class ChannelAudioConfig extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public enabled: boolean;
    public stageId: number | undefined;
    public minRepLevel: number;

    /**
     * Update the channels audio config
     * @param configData - The new audio config
     */
    public update(configData: { enabled: boolean, stageId: number, minRepLevel: number }): Promise<Response>;

    toJSON(): {
        id: number;
        enabled: boolean;
        stageId: number | undefined;
        minRepLevel: number;
    };
}

export class ChannelAudioCounts extends BaseModel {
    private constructor(client: WOLF, data: object)

    public broadcasterCount: number;
    public consumerCount: number;
    public id: number;

    toJSON(): {
        broadcasterCount: number;
        consumerCount: number;
        id: number;
    };
}

export class ChannelAudioSlot extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    /**
     * @deprecated use {@link channelId} instead
     */
    public groupId: number;
    public channelId: number;
    public locked: boolean;
    public occupierId: number;
    public uuid: string;
    public connectionState: StageConnectionState;
    public reservedOccupierId: number | undefined;
    public reservedExpiresAt: Date | undefined;

    /**
     * Join the slot
     */
    public join(): Promise<Response>;
    /**
     * Leave the slot
     */
    public leave(): Promise<Response>;
    /**
     * Kick the slot
     */
    public kick(): Promise<Response>;
    /**
     * Mute the slot
     */
    public mute(): Promise<Response>;
    /**
     * Unmute the slot
     */
    public unmute(): Promise<Response>;
    /**
     * Lock the slot
     */
    public lock(): Promise<Response>;
    /**
     * Unlock the slot
     */
    public unlock(): Promise<Response>;

    /**
     * Request a slot for the bot or specified subscriber
     * @param subscriberId - The ID of the subscriber (Default: undefined)
     */
    public request(subscriberId: number | undefined): Promise<Response>;
    /**
     * Cancel the audio slot request
     */
    public cancelRequest(): Promise<Response>;

    toJSON(): {
        id: number;
        channelId: number;
        groupId: number;
        locked: boolean;
        occupierId: number;
        uuid: string;
        connectionState: StageConnectionState;
        reservedOccupierId: number | undefined;
        reservedExpiresAt: Date | undefined;
    };
}

export class ChannelAudioSlotRequest extends BaseModel {
    private constructor(client: WOLF, data: object)

    public slotId: number;
    public channelId: number;
    /**
     * @deprecated use {@link channelId} instead
     */
    public groupId: number;
    public reservedOccupierId: number;
    public reservedExpiresAt: Date;

    /**
     * Delete the audio slot request
     */
    public delete(): Promise<Response>;
    /**
     * Accept the audio slot request
     */
    public accept(): Promise<Response>;
    /**
     * Reject the audio slot request
     */
    public reject(): Promise<Response>;

    toJSON(): {
        slotId: number;
        channelId: number;
        groupId: number;
        reservedOccupierId: number;
        reservedExpiresAt: Date;
    };
}

export class ChannelAudioSlotUpdate extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public slot: ChannelAudioSlot;
    public sourceSubscriberId: number;

    toJSON(): {
        id: number;
        slot: {
            id: number;
            groupId: number;
            channelId: number;
            locked: boolean;
            occupierId: number;
            uuid: string;
            connectionState: StageConnectionState;
            reservedOccupierId: number | undefined;
            reservedExpiresAt: Date | undefined;
        };
    };
}

export class ChannelExtended extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public longDescription: string;
    public discoverable: boolean;
    public language: Language;
    public category: Category;
    public advancedAdmin: boolean;
    public questionable: boolean;
    public locked: boolean;
    public closed: boolean;
    public passworded: boolean;
    public entryLevel: number;

    /**
     * Update the channels extended profile
     * @param extendedData - The new extended profile
     */
    public update(extendedData: { longDescription: string, discoverable: boolean, language: Language, category: Category, advancedAdmin: boolean, questionable: boolean, locked: boolean, closed: boolean, entryLevel: number }): Promise<Response>;

    toJSON(): {
        id: number;
        longDescription: string;
        discoverable: boolean;
        language: Language;
        category: Category; channelId
        advancedAdmin: boolean;
        questionable: boolean;
        locked: boolean;
        closed: boolean;
        passworded: boolean;
        entryLevel: number;
    };
}

export class ChannelMember extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public hash: string;
    public capabilities: Capability;

    /**
     * Get the subscribers profile
     */
    public subscriber(): Promise<Subscriber>;

    public coowner(): Promise<Response>;
    /**
     * Admin this member
     */
    public admin(): Promise<Response>;
    /**
     * Mod this member
     */
    public mod(): Promise<Response>;
    /**
     * Reset this member
     */
    public regular(): Promise<Response>;
    /**
     * Kick this member
     */
    public kick(): Promise<Response>;
    /**
     * Silence this member
     */
    public silence(): Promise<Response>;
    /**
     * Ban this member
     */
    public ban(): Promise<Response>;


    /**
     * Assign a Channel Role
     * @param roleId - The ID of the role
     */
    public assign(roleId: number): Promise<Response>;
    /**
     * Unassign a Channel Role
     * @param roleId - The ID of the role
     */
    public unassign(roleId): Promise<Response>

    toJSON(): {
        id: number;
        hash: string;
        capabilities: Capability;
    };
}

export class ChannelMemberManager {
    readonly _metadata: any;
    readonly _members: Map;
}

export class ChannelMessageConfig extends BaseModel {
    private constructor(client: WOLF, data: object)

    public disableHyperlink: boolean;
    public disableImage: boolean;
    public disableImageFilter: boolean;
    public disableVoice: boolean;
    public id: number;
    public slowModeRateInSeconds: number;

    /**
     * Update the message config
     * @param messageConfig - The new message config settings
     */
    public update(messageConfig: { disableHyperlink?: boolean, disableImage?: boolean, disableImageFilter?: boolean, disableVoice?: boolean, slowModeRateInSeconds?: number }): Promise<Response>;

    toJSON(): {
        disableHyperlink: boolean;
        disableImage: boolean;
        disableImageFilter: boolean;
        disableVoice: boolean;
        id: number;
        slowModeRateInSeconds: number;
    };
}
=======
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
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82

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

<<<<<<< HEAD
export class MessageEdit extends BaseModel {
    private constructor(client: WOLF, data: object)

    public subscriberId: number;
    public timestamp: number;

    /**
     * Get the subscriber profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        subscriberId: number;
        timestamp: number;
    };
}

export class MessageEmbed extends BaseModel {
    private constructor(client: WOLF, data: object)

    public type: EmbedType;
    public channelId: number;
    /**
     * @deprecated use {@link channelId} instead
     */
    public groupId: number;
    public url: string;
    public title: string;
    public image: Buffer;
    public body: string;

    toJSON(): {
        type: EmbedType;
        groupId: number;
        channelId: number;
        url: string;
        title: string;
        image: Buffer;
        body: string;
    };
}

export class MessageMetadata extends BaseModel {
    private constructor(client: WOLF, data: object)

    public formatting: MessageMetadataFormatting;
    public isDeleted: boolean;
    /**
     * NOT IMPLEMENTED
     */
    public isEdited: boolean;
    public isSpam: boolean;
    public isTipped: boolean;

    toJSON(): {
        formatting: {
            groupLinks: Array<{
                start: number;
                end: number;
                groupId: number;
            }>;
            channelLinks: Array<{
                start: number;
                end: number;
                channelId: number;
            }>;
            links: Array<{
                start: number;
                end: number;
                url: string;
            }>
        };
        isDeleted: boolean;
        /**
         * NOT IMPLEMENTED
         */
        isEdited: boolean;
        isSpam: boolean;
        isTipped: boolean;
    };
}

export class MessageMetadataFormatting extends BaseModel {
    private constructor(client: WOLF, data: object)

    public groupLinks: Array<MessageMetadataFormattingChannelLink>;
    public channelLinks: Array<MessageMetadataFormattingChannelLink>;
    public links: Array<MessageMetadataFormattingUrl>

    toJSON(): {
        groupLinks: Array<{
            start: number;
            end: number;
            groupId: number;
        }>;
        channelLinks: Array<{
            start: number;
            end: number;
            channelId: number;
        }>;
        links: Array<{
            start: number;
            end: number;
            url: string;
        }>
    };
}

export class MessageMetadataFormattingChannelLink extends BaseModel {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    /**
     * @deprecated use {@link channelId} instead
     */
    public groupId: number;
    public channelId: number;

    /**
     * Get the group profile
     * @deprecated use {@link channel} instead
     */
    public group(): Promise<Channel>;
    /**
     * Get the channel profile
     */
    public channel(): Promise<Channel>;

    toJSON(): {
        start: number;
        end: number;
        groupId: number;
        channelId: number;
    };
}

export class MessageMetadataFormattingUrl extends BaseModel {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public url: string;

    /**
     * Get the link metadata
     */
    public metadata(): Promise<LinkMetadata>;

    toJSON(): {
        start: number;
        end: number;
        url: string;
    };
}
export class MessageResponse extends BaseModel {
    private constructor(client: WOLF, data: object)

    public uuid: string;
    public timestamp: number;
    public slowModeRateInSeconds: number;

    toJSON(): {
        uuid: string;
        timestamp: number;
        slowModeRateInSeconds: number;
    };
}

export class MessageSettings extends BaseModel {
    private constructor(client: WOLF, data: object)

    public spamFilter: MessageSettingFilter;

    toJSON(): {
        spamFilter: {
            enabled: boolean,
            tier: MessageFilterTier
        }
    };
}

export class MessageSendOptions {
    public formatting: {
        /**
         * Whether or not the message should show a link/ad preview
         */
        includeEmbeds: false | boolean,
        /**
         * Whether or not the message should show rendered ads
         */
        renderAds: true | boolean;
        /**
         * Whether or not the message should show rendered links
         */
        renderLinks: true | boolean;
        /**
         * Whether or not the bot should append (Y) to the start of the message
         */
        success: boolean,
        /**
         * Whether or not the bot should append (N) to the start of the message
         */
        failed: boolean,
        /**
         * Whether or not the bot should send the message with /me formatting
         */
        me: boolean,
        /**
         * Whether or not the bot should send the message with /alert formatting
         */
        alert: boolean
    }
}

export class MessageSettingFilter extends BaseModel {
    private constructor(client: WOLF, data: object)

    public enabled: boolean;
    public tier: MessageFilterTier;

    /**
     * Update the message filter settings
     * @param messageFilterTier - The new message filter tier
     */
    public update(messageFilterTier: MessageFilterTier): Promise<Response>;

    toJSON(): {
        enabled: boolean,
        tier: MessageFilterTier
    };
}
=======
export class MessageUpdate {
  sourceUserId: number | null;
  targetChannelId: number | null;
  isChannel: boolean;
  timestamp: number;
  body: string;
  metadata: MessageMetadata | null;
  edited: MessageEdited | null;
  isCommand: boolean;
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82

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
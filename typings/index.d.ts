
import { StatusCodes } from 'http-status-codes';
import type { Stream } from 'stream';

export class Response<t = undefined> {
    /**
     * Status of the request
     */
    public code: StatusCodes;
    /**
     * The body of the request
     */
    public body: t;
    /**
     * The headers of the request
     */
    public headers: { [key: string]: any }

    /**
     * Whether or not the status Code is within success range
     */
    public success: boolean;
}


export class WOLF {
    public constructor();

    /**
     * The bot configuration
     */
    readonly config: Configuration;
    /**
     * Exposes the Achievement methods
     */
    readonly achievement: AchievementHelper;
    /**
     * Exposes the Authorization methods
     */
    readonly authorization: AuthorizationHelper;
    /**
    * Exposes the Banned methods
    */
    readonly banned: BannedHelper;
    /**
    * Exposes the Charm methods
    */
    readonly charm: CharmHelper;
    /**
     * Exposes the Channel methods
     */
    readonly channel: ChannelHelper;
    /**
    * Exposes the Command Handler methods
    */
    readonly commandHandler: CommandHandler;
    /**
    * Exposes the Contact methods
    */
    readonly contact: ContactHelper;
    /**
    * Exposes the Discovery methods
    */
    readonly discovery: DiscoveryHelper;
    /**
    * Exposes the Event methods
    */
    readonly event: EventHelper;
    /**
    * Exposes the Group methods
    * @deprecated use channel instead
    */
    readonly group: ChannelHelper;
    /**
     * Exposes the Logging methods
     */
    readonly log: LogHelper;
    /**
    * Exposes the Messaging methods
    */
    readonly messaging: MessagingHelper;
    /**
    * Exposes the Multimedia methods
    */
    readonly multimedia: Multimedia;
    /**
    * Exposes the methods that don't fit into any of the existing helpers
    */
    readonly misc: MiscHelper;
    /**
    * Exposes the Notifications methods
    */
    readonly notification: NotificationHelper;
    /**
    * Exposes the Phrase methods
    */
    readonly phrase: PhraseHelper;
    /**
    * Exposes the Stage methods
    */
    readonly stage: StageHelper;
    /**
    * Exposes the Store methods
    */
    readonly store: StoreHelper;
    /**
    * Exposes the Subscriber methods
    */
    readonly subscriber: SubscriberHelper;
    /**
    * Exposes the Tipping methods
    */
    readonly tipping: TippingHelper;
    /**
    * Exposes the Topic methods
    */
    readonly topic: TopicHelper;
    /**
    * Exposes the Utility methods
    */
    readonly utility: Utility;
    /**
    * Exposes the Websocket methods
    */
    readonly websocket: Websocket;

    /**
     * Login to WOLF using credentials stored in configuration
     */
    public login(): void;
    /**
     * Login to WOLF
     * @param email - The email belonging to the account
     * @param password - The password belonging to the account
     * @param onlineState - The onlineState to appear as (Default: Online)
     * @param loginType - The loginType (Default: Email)
     */
    public login(email: string, password: string, onlineState?: OnlineState, loginType?: LoginType): Promise<void>;

    /**
     * Connect to the service without login details
     * - Note: Will login if details are in config
     */
    public connect(): Promise<void>;
    /**
     * Reconnect the websocket and relog if possible
     */
    public reconnect(): Promise<void>;
    /**
     * Disconnect the websocket
     */
    public disconnect(): Promise<void>;
    /**
     * Logout of WOLF
     */
    public logout(): Promise<void>;

    /**
     * EventEmitter
     * @param event - The event name
     * @param listener - The event handler
     */
    public on<evtStr extends keyof ClientEvents>(event: evtStr, listener: (...args: ClientEvents[evtStr]) => Promise<void>): this;

    /**
     * The account currently logged in
     */
    readonly currentSubscriber: Subscriber;

    /**
     * Split string at commas, newlines, spaces, etc
     */
    readonly SPLIT_REGEX: RegExp;

    /**
     * Update the current logged in account profile
     * @param profileData - The new profile data
     */
    public update(profileData: { nickname: string, status: string, dateOfBirth: Date, about: string, gender: Gender, language: Language, lookingFor: LookingFor, name: string, relationship: Relationship, urls: Array<string>, avatar: Buffer }): Promise<Response>;

}

export class Websocket {
    private constructor(client: WOLF);

    /**
     * Send a request to the server
     * @param command - The command
     * @param body - The command body
     */
    public emit<T>(command: string, body?: Object): Response<T>;
}

export class Multimedia {
    private constructor(client: WOLF);


    /**
     * Send a request to the multimedia service
     * @param config - The route configuration
     * @param body - The data to uplodate
     */
    public request<T>(config: any, body: object): Promise<Response<T>>

    /**
     * Upload to the multimedia service
     * @deprecated Use request
     * @param config - The route configuration
     * @param body - The data to uplodate
     */
    public upload<T>(config: any, body: object): Promise<Response<T>>
}

export class Configuration {
    /**
     * The ID of the currently logged in account
     */
    public subscriberId: number;
    /**
     * The keyword belonging to the project
     * - Default: default
     */
    public keyword: string;
    /**
     * The framework settings
     */
    public framework: {
        /**
         * The ID of the developer
         * - Default: undefined
         */
        developer: number;
        /**
         * The default language of responses
         * - Default: en
         */
        language: string;
        /**
         * Login details
         */
        login: {
            /**
             * The email belonging to the account
             */
            email: string;
            /**
             * The password belonging to the account
             */
            password: string;
            /**
             * The online state the bot should appear as
             * - Default: 1
             */
            onlineState: OnlineState;
            /**
             * The account token (Automatically generated if none provided)
             * - Default: undefined
             */
            token: string,

            /**
             * The account login type
             * - Default: Email
             */
            type: LoginType
        },
        /**
         * Command settings
         */
        commands: {
            /**
             * Command ignore settings
             */
            ignore: {
                /**
                 * Whether or not the bot should allow official bots to use commands
                 * - Default: false
                 */
                official: boolean;
                /**
                 * Whether or not the bot should allow unofficial bots to use commands
                 * - Default: false
                 */
                unofficial: boolean;
                /**
                 * Whether or not the bot should allow itself to use commands
                 * - Default: true
                 */
                self: boolean;
            }
        },
        /**
         * Message settings
         */
        messages: {
            /**
             * Message ignore settings
             */
            ignore: {
                /**
                 * Whether or not the bot should process its own messages
                 * - Default: false
                 */
                self: boolean;
            }
        },
        /**
         * Subscription settings
         */
        subscriptions: {
            /**
             * Message subscriptions
             */
            messages: {
                /**
                 * Group settings
                 * @deprecated use channel instead
                 */
                group: {
                    /**
                     * Whether or not the bot should receive group messages
                     * - Default: true
                     */
                    enabled: boolean;
                    /**
                     * Whether or not the bot should receive group messages tip events
                     * - Default: true
                     */
                    tipping: boolean;
                },
                channel: {
                    /**
                     * Whether or not the bot should receive channel messages
                     * - Default: true
                     */
                    enabled: boolean;
                    /**
                     * Whether or not the bot should receive channel messages tip events
                     * - Default: true
                     */
                    tipping: boolean;
                },
                /**
                 * Private settings
                 */
                private: {
                    /**
                     * Whether or not the bot should receive private messages
                     * - Default: true
                     */
                    enabled: boolean;
                    /**
                     * Whether or not the bot should receive private messages tip events (Not Implemented)
                     * - Default: false
                     */
                    tipping: boolean;
                }
            }
        },
        rateLimiter: {
            /**
             * Whether or not the internal rate limiter should be enabled
             * - Default: false (Broken)
             */
            enabled: boolean
        }
    }
}

export class CommandHandler {
    private constructor(client: WOLF);

    /**
     * Register commands
     * @param commands - The commands to register
     */
    public register(commands: Array<Command>): void;
    /**
     * Check whether a message is a command or not
     * @param message - The message to check
     */
    public isCommand(message: Message): boolean;
}

export class Command {
    /**
     *
     * @param phraseName - The phrase name
     * @param callbackObject - The command callbacks
     * @param children - The sub commands for the command
     */
    constructor(phraseName: string, callbackObject: {
        /**
         * @deprecated use channel instead
         */
        group: (command: CommandContext, ...args: any) => void,
        channel: (command: CommandContext, ...args: any) => void,
        private: (command: CommandContext, ...args: any) => void,
        both: (command: CommandContext, ...args: any) => void
    }, children?: Array<Command>)
}
export class BaseHelper {
    public constructor(client: WOLF);

    readonly client: WOLF;

    private _cleanUp(reconnection: boolean)
}

//#region Helpers
export class AchievementHelper extends BaseHelper {
    private constructor(client)

    /**
     * Exposes the Achievement Category methods
     */
    readonly category: AchievementCategoryHelper;
    /**
     * Exposes the Channel Achievement methods
     */
    readonly channel: AchievementChannelHelper;
    /**
     * Exposes the Group Achievement methods
     * @deprecated use channel instead
     */
    readonly group: AchievementChannelHelper;
    /**
     * Exposes the Subscriber Achievement methods
     */
    readonly subscriber: AchievementSubscriberHelper;
    /**
     * Get an achievement
     * @param id - The ID of the achievement
     * @param language - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, language: Language, forceNew?: boolean): Promise<Achievement>;
    /**
     * Get achievements
     * @param ids - The list of achievement IDs
     * @param language - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, language: Language, forceNew?: boolean): Promise<Array<Achievement>>;
}

export class AchievementCategoryHelper extends BaseHelper {
    private constructor(client);

    /**
     * Request the Achievement Categories
     * @param language - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getList(language: Language, forceNew?: boolean): Promise<Array<Achievement>>;
}

export class AchievementChannelHelper extends BaseHelper {
    private constructor(client);

    /**
     * Request Achievement list for a channel
     * @param targetChannelId - The ID of the channel to request
     * @param parentId - Provide if requesting child achievements (Optional)
     */
    public getById(targetChannelId: number, parentId?: number): Promise<Array<AchievementUnlockable>>;
}

export class AchievementSubscriberHelper extends BaseHelper {
    private constructor(client);

    /**
     * Request Achievement list for a subscriber
     * @param subscriberId - The ID of the subscriber to request
     * @param parentId - Provide if requesting child achievements (Optional)
     */
    public getById(subscriberId: number, parentId?: number): Promise<Array<AchievementUnlockable>>;
}

export class AuthorizationHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get a list of authorized subscribers
     */
    public list(): Array<number>;
    /**
     * Clear the list of authorized subscribers
     */
    public clear(): void;
    /**
     * Check whether or not a subscriber ID is authorized
     * @param targetSubscriberIds - The ID or IDs to check
     */
    public isAuthorized(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Add subscriber ID or IDs to the authorization list
     * @param targetSubscriberIds - The ID or IDs to authorized
     */
    public authorize(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Remove subscriber ID or IDs from the authorization list
     * @param targetSubscriberIds - The ID or IDs to unauthorize
     */
    public unauthorize(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
}

export class BannedHelper extends BaseHelper {
    private constructor(client);

    /**
    * Get a list of banned subscribers
    */
    public list(): Array<number>;
    /**
     * Clear the list of banned subscribers
     */
    public clear(): void;
    /**
     * Check whether or not a subscriber ID is banned
     * @param targetSubscriberIds - The ID or IDs to check
     */
    public isBanned(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Add subscriber ID or IDs to the banned list
     * @param targetSubscriberIds - The ID or IDs to ban
     */
    public ban(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Remove subscriber ID or IDs from the banned list
     * @param targetSubscriberIds - The ID or IDs to unban
     */
    public unban(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
}

export class CharmHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get the list of charms
     */
    public list(): Array<Charm>;
    /**
     * Get a charm
     * @param id - The ID of the charm
     */
    public getById(id: number): Promise<Charm>;
    /**
     * Get charms
     * @param ids - The list of charm IDs
     */
    public getByIds(ids: number | Array<number>): Promise<Charm | Array<Charm>>;
    /**
     * Get a subscribers charm summary
     * @param subscriberId - The ID of the subscriber
     */
    public getSubscriberSummary(subscriberId: number): Promise<Array<CharmSummary>>
    /**
     * Get a subscribers gifting statistics
     * @param subscriberId - The ID of the subscriber
     */
    public getSubscriberStatistics(subscriberId: number): Promise<CharmStatistics>
    /**
     * Get the list of active charms a subscriber has
     * @param subscriberId - The ID of the subscriber
     * @param limit - How many should be requested (Default: 25)
     * @param offset - Where the request should start at (Default: 0)
     */
    public getSubscriberActiveList(subscriberId: number, limit?: number, offset?: number): Promise<Array<CharmExpiry>>
    /**
     * Get the list of expired charms a subscriber has
     * @param subscriberId - The ID of the subscriber
     * @param limit - How many should be requested (Default: 25)
     * @param offset - Where the request should start at (Default: 0)
     */
    public getSubscriberExpiredList(subscriberId: number, limit?: number, offset?: number): Promise<Array<CharmExpiry>>
    /**
     * Get the list of charms a subscriber has selected
     * @param subscriberId - The ID of the subscriber
     */
    public getSubscriberSelectedList(subscriberId: number): Promise<SubscriberSelectedCharm>
    /**
     * Delete charms from the bots Active or Expired list
     * @param charmIds - The ID or IDs of the charms to delete
     */
    public delete(charmIds: number | Array<number>): Promise<Response>
    /**
     * Set a charm on the bots profile
     * @param charms - The charm to set
     */
    public set(charms: CharmSelectedBuilder): Promise<Response>;
}

export class ContactHelper extends BaseHelper {
    private constructor(client);

    /**
     * Exposes the Blocked methods
     */
    readonly blocked: BlockedHelper;
    /**
     * Get the Bots contacts list
     */
    public list(subscribe?: boolean): Promise<Array<Contact>>;
    /**
     * Check whether or not a subscriber is a contact
     * @param subscriberIds - The ID of the subscriber
     */
    public isContact(subscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Add a subscriber as a contact
     * @param subscriberId - The ID of the subscriber
     */
    public add(subscriberId: number): Promise<Response>;
    /**
     * Remove a subscriber as a contact
     * @param subscriberId - The ID of the subscriber
     */
    public delete(subscriberId: number): Promise<Response>;
}

export class BlockedHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get the Bots blocked list
     */
    public list(subscribe?: boolean): Promise<Array<Contact>>;
    /**
     * Check whether or not a subscriber is blocked
     * @param subscriberIds - The ID of the subscriber
     */
    public isBlocked(subscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    /**
     * Block a subscriber
     * @param subscriberId - The ID of the subscriber
     */
    public block(subscriberId: number): Promise<Response>;
    /**
     * Unblock a subscriber
     * @param subscriberId - The ID of the subscriber
     */
    public unblock(subscriberId: number): Promise<Response>;
}

export class DiscoveryHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get the discovery page
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public get(languageId: Language, forceNew?: boolean): Promise<Discovery>;
}

export class EventHelper extends BaseHelper {
    private constructor(client);
    /**
     * Exposes the channel event methods
     */
    readonly channel: ChannelEventHelper;
    /**
     * Exposes the group event methods
     * @deprecated use channel instead
     */
    readonly group: ChannelEventHelper;
    /**
     * Exposes the subscriber event subscription methods
     */
    readonly subscription: EventSubscriptionHelper;

    /**
     * Get an event
     * @param id - The ID of the event
     */
    public getById(id: number): Promise<Event>;
    /**
     * Get events
     * @param ids - The list of event IDs
     */
    public getByIds(ids: number | Array<number>): Promise<Event | Array<Event>>;
}

export class ChannelEventHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get the channels event list
     * @param targetChannelId - The ID of the channel
     * @param subscribe - Whether or not to subscribe to the channels event list
     * @param forceNew - Whether or not to request new from the server
     */
    public getList(targetChannelId: number, subscribe?: boolean, forceNew?: boolean): Promise<Array<Event>>;

    /**
     * Create an event without a thumbnail
     * @param targetChannelId - The ID of the channel
     * @param eventData - The event data
     */
    public create(targetChannelId: number, eventData: { title: string, startsAt: Date, endsAt: Date, shortDescription?: string, longDescription?: string }): Promise<Response<Event>>
    /**
     * Create an event with a thumbnail
     * @param targetChannelId - The ID of the channel
     * @param eventData - The event data
     */
    public create(targetChannelId: number, eventData: { title: string, startsAt: Date, endsAt: Date, shortDescription?: string, longDescription?: string, thumbnail: Buffer }): Promise<[Response<Event>, Response]>
    /**
     * Update an existing event using the existing thumbnail
     * @param targetChannelId - The ID of the channel
     * @param eventId - The ID of the event
     * @param eventData - The new event data
     */
    public update(targetChannelId: number, eventId: number, eventData: { title?: string, startsAt?: Date, endsAt?: Date, shortDescription?: string, longDescription?: string }): Promise<Response<any>>
    /**
     * Update an existing event using a new thumbnail
     * @param targetChannelId - The ID of the channel
     * @param eventId - The ID of the event
     * @param eventData - The new event data
     */
    public update(targetChannelId: number, eventId: number, eventData: { title?: string, startsAt?: Date, endsAt?: Date, shortDescription?: string, longDescription?: string, thumbnail?: Buffer }): Promise<[Response<Event>, Response]>

    /**
     * Update an events thumbnail
     * @param eventId - The ID of the event
     * @param thumbnail - The new thumbnail
     */
    public updateThumbnail(eventId: number, thumbnail: Buffer): Promise<Response>

    /**
     * Cancel an event
     * @param targetChannelId - The ID of the channel
     * @param eventId - The ID of the event
     */
    public delete(targetChannelId: number, eventId: number): Promise<Response>
}

export class EventSubscriptionHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get list of Bots event subscriptions
     * @param subscribe - Whether or not to subscribe to subscription changes (Default: true)
     */
    public getList(subscribe?: boolean): Promise<Array<Event>>;
    /**
     * Add an event to the bots event subscription list
     * @param eventId - The ID of the event
     */
    public add(eventId: number): Promise<Response>;
    /**
     * Remove an event from the bots event subscription list
     * @param eventId - The ID of the event
     */
    public remove(eventId: number): Promise<Response>;
}

export class ChannelHelper extends BaseHelper {
    private constructor(client);

    /**
     * Exposes the Channel Member methods
     */
    readonly member: ChannelMemberHelper;

    /**
     * Exposes the Channel Role methods
     */
    readonly role: ChannelRoleHelper;

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
}


export class ChannelRoleHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get the context of a Channel role
     * @param roleId - The ID of the role
     * @param languageId - The Language
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(roleId: number, languageId: Language, forceNew: false): Promise<ChannelRoleContext>;

    /**
     * Get the context of Channel roles
     * @param roleIds - The ID of the roles
     * @param languageId - The Language
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(roleIds: number | Array<number>, languageId: Language, forceNew: false): Promise<Array<ChannelRoleContext>>;

    /**
     *
     * @param id - The ID of the channel
     * @param forceNew - Whether or not to request new from the server
     */
    public roles(id: number, forceNew: boolean): Promise<Array<ChannelRole>>;

    /**
     * Get the list of members with Channel Roles
     * @param id - The ID of the channel
     * @param subscribe - Whether or not to subscribe to member updates
     * @param forceNew  - Whether or not to request new from the server
     */
    public members(id: number, subscribe: boolean, forceNew: boolean): Promise<Array<ChannelRoleMember>>;

    /**
     * Assign a Channel Role
     * @param id - The ID of the channel
     * @param subscriberId - The ID of the subscriber to give the role to
     * @param roleId - The ID of the role to assign
     */
    public assign(id: number, subscriberId: number, roleId: number): Promise<Response>;

    /**
     * Reassign a Channel Role
     * @param id - The ID of the channel
     * @param oldSubscriberId - The ID of the subscriber that currently has the role
     * @param newSubscriberId - The ID of the subscriber to give the role to
     * @param roleId - The role to reassign
     */
    public reassign(id: number, oldSubscriberId: number, newSubscriberId: number, roleId: number): Promise<Response>;

    /**
     * Unassign a Channel Role
     * @param id - The ID of the channel
     * @param subscriberId - The ID of the subscriber
     * @param roleId - The ID of the role to remove
     */
    public unassign(id: number, subscriberId: number, roleId: number): Promise<Response>;
}

export class LogHelper extends BaseHelper {
    public constructor(client: WOLF);

    /**
     * Log a debug message
     * @param message - The message
     */
    public debug(message: string): void;
    /**
     * Log a info message
     * @param message - The message
     */
    public info(message: string): void;
    /**
     * Log a warn message
     * @param message - The message
     */
    public warn(message: string): void;
    /**
     * Log a error message
     * @param message - The message
     */
    public error(message: string): void;
}

export class MessagingHelper extends BaseHelper {
    private constructor(client);

    readonly subscription: MessagingSubscriptionHelper;

    /**
     * Send a group message
     * @deprecated use sendChannelMessage
     * @param targetChannelId - The ID of the group
     * @param content - The message
     * @param options - The sending options
     */
    public sendGroupMessage(targetChannelId: number, content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>;
    /**
     * Send a channel message
     * @param targetChannelId - The ID of the channel
     * @param content - The message
     * @param options - The sending options
     */
    public sendChannelMessage(targetChannelId: number, content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>;

    /**
     * Send a private message
     * @param targetSubscriberId - The ID of the subscriber
     * @param content - The message
     * @param options - The sending options
     */
    public sendPrivateMessage(targetSubscriberId: number, content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>;
    /**
     * Send a message based on command or message
     * @param commandOrMessage - The command or message to send from
     * @param content - The message
     * @param options - The sending options
     */
    public sendMessage(commandOrMessage: Command | Message, content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>;
    /**
     * Get message edit history
     * @deprecated use getChannelMessageEditHistory
     * @param targetChannelId - The ID of the group
     * @param timestamp - The timestamp of the message
     */
    public getGroupMessageEditHistory(targetChannelId: number, timestamp: number): Promise<Array<MessageUpdate>>;
    /**
    * Get message edit history
    * @param targetChannelId - The ID of the channel
    * @param timestamp - The timestamp of the message
    */
    public getChannelMessageEditHistory(targetChannelId: number, timestamp: number): Promise<Array<MessageUpdate>>;
    /**
     * Delete a group message
     * @deprecated use deleteChannelMessage
     * @param targetChannelId - The ID of the group
     * @param timestamp - The timestamp of the message
     */
    public deleteGroupMessage(targetChannelId: number, timestamp: number): Promise<Response>;
    /**
     * Delete a channel message
     * @param targetChannelId - The ID of the channel
     * @param timestamp - The timestamp of the message
     */
    public deleteChannelMessage(targetChannelId: number, timestamp: number): Promise<Response>;
    /**
     * Restore a delete group message
     * @deprecated use restoreChannelMessage
     * @param targetChannelId - The ID of the group
     * @param timestamp - The timestamp of the message
     */
    public restoreGroupMessage(targetChannelId: number, timestamp: number): Promise<Response>;
    /**
     * Restore a delete channel message
     * @param targetChannelId - The ID of the channel
     * @param timestamp - The timestamp of the message
     */
    public restoreChannelMessage(targetChannelId: number, timestamp: number): Promise<Response>;

    /**
     * Get the bots conversation list
     */
    public getConversationList(): Promise<Array<Message>>;
}

export class MessagingSubscriptionHelper extends BaseHelper {
    private constructor(client);

    readonly subscriptions: {
        [key: string]: {
            id: string,
            predicate: Function,
            def: Promise<Message>,
            timeout: Number
        }
    }
    /**
     * Watch for a specific message
     * @param predicate - Predicate to match
     * @param timeout - How long to wait
     */
    public nextMessage(predicate: Function, timeout?: Number): Promise<Message | undefined>
    /**
     * Wait for the next group message
     * @deprecated use nextChannelMessage
     * @param targetChannelId - The ID of the group
     * @param timeout - How long to wait
     */
    public nextGroupMessage(targetChannelId: number, timeout?: Number): Promise<Message | undefined>
    /**
     * Wait for the next channel message
     * @param targetChannelId - The ID of the channel
     * @param timeout - How long to wait
     */
    public nextChannelMessage(targetChannelId: number, timeout?: Number): Promise<Message | undefined>
    /**
     * Wait for the next subscriber message
     * @param sourceSubscriberId - The ID of the subscriber
     * @param timeout - How long to wait
     */
    public nextPrivateMessage(sourceSubscriberId: number, timeout?: Number): Promise<Message | undefined>
    /**
     * Wait for the next message in a group by a specific subscriber
     * @deprecated use nextChannelSubscriberMessage
     * @param targetChannelId - The ID of the channel
     * @param sourceSubscriberId - The ID of the subscriber
     * @param timeout - How long to wait
     */
    public nextGroupSubscriberMessage(targetChannelId: number, sourceSubscriberId: number, timeout?: Number): Promise<Message | undefined>

    /**
     * Wait for the next message in a channel by a specific subscriber
     * @param targetChannelId - The ID of the channel
     * @param sourceSubscriberId - The ID of the subscriber
     * @param timeout - How long to wait
     */
    public nextChannelSubscriberMessage(targetChannelId: number, sourceSubscriberId: number, timeout?: Number): Promise<Message | undefined>

}

export class MiscHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get metadata for a url
     * @param url - The URL
     */
    public metadata(url: string): Promise<Response<LinkMetadata>>;
    /**
     * Get list of blacklisted links
     * @param forceNew - Whether or not to request new from the server
     */
    public linkBlacklist(forceNew?: boolean): Promise<Array<BlacklistLink>>;
    /**
     * Get the AWS security token
     * @param forceNew - Whether or not to request new from the server
     */
    public getSecurityToken(forceNew?: boolean): Promise<any>;
    /**
     * Get Bot message settings
     */
    public getMessageSettings(): Promise<Response<MessageSettings>>;
    /**
     * Set the Bot message settings
     * @param messageFilterTier - The spam filter tier
     */
    public updateMessageSettings(messageFilterTier: MessageFilterTier): Promise<Response>;
}

export class NotificationHelper extends BaseHelper {
    private constructor(client);

    readonly ubscriber: NotificationSubscriberHelper;
    readonly global: NotificationGlobalHelper;

    /**
     * Get notifications
     * @param forceNew - Whether or not to request new from the server
     * @deprecated
     */
    public list(forceNew?: boolean): Promise<Array<LegacyNotification>>;
    /**
     * Clear notifications list
     * @deprecated
     */
    public clear(): Promise<Response>;
}

export class NotificationSubscriberHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get a subscriber notification
     * @param id - The id of the notification
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, languageId: Language, forceNew?: boolean): Promise<Notification>;

    /**
     * Get multiple subscriber notifications
     * @param ids - The ids of the notifications
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, languageId: Language, forceNew?: boolean): Promise<Notification | Array<Notification>>;

    /**
     * Get your accounts subscriber notifications list
     * @param languageId - The language to request in
     * @param limit - How many to request
     * @param offset - Where to request at
     * @param subscribe - Whether or not to subscribe to updates (Default: true)
     * @param forceNew - Whether or not to request new form the server
     */
    public list(languageId: Language, limit?: number, offset?: number, subscribe?: boolean, forceNew?: boolean): Promise<Array<Notification>>;

    /**
     * Clear the accounts subscriber notifications list
     */
    public clear(): Promise<Response>;

    /**
     * Delete subscriber notifications
     * @param ids - The ids of the notifications
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public delete(ids: number | Array<number>, languageId: Language, forceNew?: boolean): Promise<Array<Response>>;

}

export class NotificationGlobalHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get a global notification
     * @param id - The id of the notification
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, languageId: Language, forceNew: boolean): Promise<Notification>;

    /**
     * Get multiple global notifications
     * @param ids - The ids of the notifications
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, languageId: Language, forceNew?: boolean): Promise<Notification | Array<Notification>>;

    /**
     * Get your accounts global notifications list
     * @param languageId - The language to request in
     * @param limit - How many to request
     * @param offset - Where to request at
     * @param subscribe - Whether or not to subscribe to updates (Default: true)
     * @param forceNew - Whether or not to request new form the server
     */
    public list(languageId: Language, limit: number, offset: number, subscribe: boolean, forceNew?: boolean): Promise<Array<Notification>>;

    /**
     * Clear the accounts global notifications list
     */
    public clear(): Promise<Response>;

    /**
     * Delete global notifications
     * @param ids - The ids of the notifications
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public delete(ids: number | Array<number>, languageId: Language, forceNew?: boolean): Promise<Array<Response>>;
}

export class PhraseHelper extends BaseHelper {
    private constructor(client);

    /**
     * Load list of phrases
     * @param phrases - The phrase list
     */
    public load(phrases: Array<Phrase>): void;
    /**
     * Get total phrase count and phrases per language
     */
    public count(): PhraseCount;
    /**
     * Get all phrases with a specific name
     * @param name - The phrase name
     */
    public getAllByName(name: string): Array<Phrase>;
    /**
     * Get a phrase by language and name
     * @param language - The language
     * @param name - The name
     */
    public getByLanguageAndName(language: string, name: string): string;
    /**
     * Get a phrase by command and name
     * @param command - The command
     * @param name - The name
     */
    public getByCommandAndName(command: CommandContext, name: string): string;
    /**
     * Check whether or not a string is a specific phrase
     * @param name - The name
     * @param input - The input
     */
    public isRequestedPhrase(name: string, input: string): boolean;
}

export class StageHelper extends BaseHelper {
    private constructor(client);

    /**
     * Exposes the Stage Request methods
     */
    readonly request: StageRequestHelper;
    /**
     * Exposes the Stage Slot methods
     */
    readonly slot: StageSlotHelper;

    /**
     * Gets all stages available for a channel
     * @param targetChannelId - The ID of the channel
     * @param forceNew - Whether or not to get new from the server
     */
    public getAvailableStages(targetChannelId: number, forceNew?: boolean): Promise<Array<ChannelStage>>
    /**
     * Get a channels stage settings
     * @param targetChannelId - The ID of the channel
     */
    public getAudioConfig(targetChannelId: number): Promise<ChannelAudioConfig>;
    /**
     * Update the channels audio config
     * @param targetChannelId - The ID of the channel
     * @param audioConfig - The new audio config
     */
    public updateAudioConfig(targetChannelId: number, audioConfig: { stageId?: number, enabled?: boolean, minRepLevel?: number }): Promise<Response>;
    /**
     * Get a channels stage settings
     * @param targetChannelId - The ID of the channel
     */
    public getAudioCount(targetChannelId: number): Promise<ChannelAudioCounts>;
    /**
     * Play audio on stage
     * @param targetChannelId - The ID of the channel (Must join first)
     * @param data - The audio stream
     */
    public play(targetChannelId: number, data: Stream): Promise<void>;
    /**
     * Stop playing audio on a stage (Will remain on stage)
     * @param targetChannelId - The ID of the channel
     */
    public stop(targetChannelId: number): Promise<void>;
    /**
     * Pause the current broadcast (Download continues in background)
     * @param targetChannelId - The ID of the channel
     */
    public pause(targetChannelId: number): Promise<void>;
    /**
     * Resume the current broadcast
     * @param targetChannelId - The ID of the channel
     */
    public resume(targetChannelId: number): Promise<void>;
    /**
     * Whether or not the bot is on stage
     * @param targetChannelId - The ID of the channel
     */
    public onStage(targetChannelId: number): Promise<boolean>
    /**
     * Get the current broadcast state of the client for a channel
     * @param targetChannelId - The ID of the channel
     */
    public getBroadcastState(targetChannelId: number): Promise<StageBroadcastState>;
    /**
     * Whether or not the client for the channel is ready to broadcast
     * @param targetChannelId - The ID of the channel
     */
    public isReady(targetChannelId: number): Promise<boolean>;
    /**
     * Whether or not the client for the channel is broadcasting
     * @param targetChannelId - The ID of the channel
     */
    public isPlaying(targetChannelId: number): Promise<boolean>;
    /**
     * Whether or not the client for the channel is paused
     * @param targetChannelId - The ID of the channel
     */
    public isPaused(targetChannelId: number): Promise<boolean>;
    /**
     * Whether or not the client for the channel is idling
     * @param targetChannelId - The ID of the channel
     */
    public isIdle(targetChannelId: number): Promise<boolean>;
    /**
     * Get the duration of the current broadcast
     * @param targetChannelId - The ID of the channel
     */
    public duration(targetChannelId: number): Promise<number>;
    /**
     * Get the volume of the current broadcast
     * @param targetChannelId - The ID of the channel
     */
    public getVolume(targetChannelId: number): Promise<number>
    /**
     * Change the volume of the current broadcast (Causes static :()
     * @param targetChannelId - The ID of the channel
     * @param volume - The volume value
     */
    public setVolume(targetChannelId: number, volume: number): Promise<void>;
    /**
    * Get the slot the bot is on
    * @param targetChannelId - The ID of the channel
    */
    public getSlotId(targetChannelId: number): Promise<number>;
}

export class StageRequestHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get list of current stage slot requests
     * @param targetChannelId - The ID of the channel
     * @param subscribe - Whether or not to subscribe to list updates
     * @param forceNew - Whether or not to fetch new from the server
     */
    public list(targetChannelId: number, subscribe?: boolean, forceNew?: boolean): Promise<ChannelAudioSlotRequest>;
    /**
     * Add request to stage request list
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     * @param subscriberId - The ID of the subscriber (Leave blank if bot is requesting for self)
     */
    public add(targetChannelId: number, slotId: number, subscriberId?: number): Promise<Response>
    /**
     * Remove a request from stage request list
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public delete(targetChannelId: number, slotId: number): Promise<Response>
    /**
     * Clear the channels current stage slot requests
     * @param targetChannelId - The ID of the channel
     */
    public clear(targetChannelId: number): Promise<Response>
}

export class StageSlotHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get list of slots
     * @param targetChannelId - The ID of the channel
     * @param subscribe - Whether or not to subscribe to slot updates
     */
    public list(targetChannelId: number, subscribe?: boolean): Promise<Array<ChannelAudioSlot>>
    /**
     * Get a channel slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public get(targetChannelId: number, slotId: number): Promise<ChannelAudioSlot>;
    /**
     * Lock a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public lock(targetChannelId: number, slotId: number): Promise<Response>;
    /**
     * Unlock a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public unlock(targetChannelId: number, slotId: number): Promise<Response>;
    /**
     * Mute a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public mute(targetChannelId: number, slotId: number): Promise<Response>;
    /**
     * Unmute a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public unmute(targetChannelId: number, slotId: number): Promise<Response>;
    /**
     * Kick a user from a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public kick(targetChannelId: number, slotId: number): Promise<Response>;
    /**
     * Join a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public join(targetChannelId: number, slotId: number): Promise<Response<Object>>;
    /**
     * Leave a slot
     * @param targetChannelId - The ID of the channel
     * @param slotId - The ID of the slot
     */
    public leave(targetChannelId: number, slotId: number): Promise<Response<Object>>;
}

export class StoreHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get list of purchasable credits
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getCreditList(languageId: Language, forceNew?: boolean): Promise<Array<StoreProductCredits>>;
    /**
     * Get store
     * @param languageId - The language to request in
     * @param includeCredits - Whether or not to include the purchasable credit list
     * @param forceNew - Whether or not to request new from the server
     */
    public get(languageId: Language, includeCredits: boolean, forceNew?: boolean): Promise<Store>;
    /**
     * Request partial products from the server
     * @param ids - The list of product IDs
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getProducts(ids: number | Array<number>, languageId: Language, forceNew?: boolean): Promise<StoreProductPartial | Array<StoreProductPartial>>;
    /**
     * Get products full profile
     * @param id - The ID of the product
     * @param languageId - The language to request in
     * @param forceNew - Whether or not to request new from the server
     */
    public getFullProduct(id: number, languageId: Language, forceNew?: boolean): Promise<StoreProduct>;
    /**
     * Purchase a product
     * @param productDurationId - The ID of the product duration
     * @param quantity - The quantity to purchase
     * @param ids - The ID of channel or users to purchase for
     */
    public purchase(productDurationId: number, quantity: number, ids: number | Array<number>): Promise<Response>;
    /**
     * Get the Bots credit balance
     * @param forceNew - Whether or not to request new from the server
     */
    public getCreditBalance(forceNew?: boolean): Promise<number>
}

export class SubscriberHelper extends BaseHelper {
    private constructor(client);

    /**
     * Exposes the Presence methods
     */
    readonly presence: SubscriberPresenceHelper;
    /**
     * Exposes the Wolfstars methods
     */
    readonly wolfstars: WolfStarsHelper;
    /**
     * Get a subscriber profile
     * @param id - The ID of the subscriber
     * @param subscribe - Whether or not to subscribe to profile updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, subscribe?: boolean, forceNew?: boolean): Promise<Subscriber>;
    /**
     * Get subscriber profiles
     * @param ids - The list of subscriber IDs
     * @param subscribe - Whether or not to subscribe to profile updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, subscribe?: boolean, forceNew?: boolean): Promise<Subscriber | Array<Subscriber>>;
    /**
     * Get chat history
     * @param id - The ID of the subscriber
     * @param timestamp - The timestamp to start at
     * @param limit - How many messages to request (Default: 15)
     */
    public getChatHistory(id: number, timestamp?: number, limit?: number): Promise<Array<Message>>;
    /**
     * Search for a subscriber
     * @param query - The search params
     */
    public search(query: string): Promise<Array<Search>>;
}


export class WolfStarsHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get a subscribers Wolfstar statistics
     * @param subscriberId - The ID of the subscriber
     */
    public getProfile(subscriberId: number): Promise<WolfstarsProfile>;
}

export class SubscriberPresenceHelper extends BaseHelper {
    private constructor(client);

    /**
     * Get a subscriber presence
     * @param id - The ID of the subscriber
     * @param subscribe - Whether or not to subscribe to presence updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getById(id: number, subscribe?: boolean, forceNew?: boolean): Promise<Presence>;
    /**
     * Get subscribers presences
     * @param ids - The list of subscriber IDs
     * @param subscribe - Whether or not to subscribe to presence updates
     * @param forceNew - Whether or not to request new from the server
     */
    public getByIds(ids: number | Array<number>, subscribe?: boolean, forceNew?: boolean): Promise<Presence | Array<Presence>>;
}

export class TippingHelper extends BaseHelper {
    private constructor(client);

    /**
     * Tip a subscriber
     * @param targetSubscriberId - The ID of the subscriber
     * @param targetChannelId - The ID of the channel
     * @param context - The context
     * @param charms - The charms to tip
     */
    public tip(targetSubscriberId: number, targetChannelId: number, context: { type: ContextType, id: number | undefined }, charms: { id: number, quantity: number } | Array<{ id: number, quantity: number }>): Promise<Response>;
    /**
     * Get a messages tip details
     * @param targetChannelId - The ID of the channel
     * @param timestamp - The timestamp of the message
     * @param limit - How many should be requested (Default: 20)
     * @param offset - Where the request should start at (Default: 0)
     */
    public getDetails(targetChannelId: number, timestamp: number, limit?: number, offset?: number): Promise<Response<TipDetail>>;
    /**
     * Get a messages tip summary
     * @param targetChannelId - The ID of the channel
     * @param timestamp - The timestamp of the message
     * @param limit - How many should be requested (Default: 20)
     * @param offset - Where the request should start at (Default: 0)
     */
    public getSummary(targetChannelId: number, timestamp: number, limit?: number, offset?: number): Promise<Response<TipSummary>>;
    /**
     * Get a groups tipping leaderboard
     * @deprecated use getChannelLeaderboard
     * @param targetChannelId - The ID of the channel
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping type
     * @param tipDirection - The tipping direction
     */
    public getGroupLeaderboard(targetChannelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboard>>;
    /**
    * Get a channels tipping leaderboard
    * @param targetChannelId - The ID of the channel
    * @param tipPeriod - The tipping period
    * @param tipType - The tipping type
    * @param tipDirection - The tipping direction
    */
    public getChannelLeaderboard(targetChannelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboard>>;
    /**
     * Get a groups tipping leaderboard summary
     * @deprecated use getChannelLeaderboardSummary
     * @param targetChannelId - The ID of the channel
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping type
     * @param tipDirection - The tipping direction
     */
    public getGroupLeaderboardSummary(targetChannelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboardSummary>>;
    /**
     * Get a channels tipping leaderboard summary
     * @param targetChannelId - The ID of the channel
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping type
     * @param tipDirection - The tipping direction
     */
    public getChannelLeaderboardSummary(targetChannelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboardSummary>>;

    /**
     * Get the global tipping leaderboard
     * @param tipPeriod - The tipping period
     * @param tipType - The tipping type
     * @param tipDirection - The tipping direction
     */
    public getGlobalLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<Response<TipLeaderboard>>;
    /**
     * Get the global tipping leaderboard summary
     * @param tipPeriod - The tipping period
     */
    public getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<Response<TipLeaderboardSummary>>;
}

export class TopicHelper extends BaseHelper {
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
     * @deprecated use channel
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

    /**
     * Get the group profile
     * @deprecated use channel
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
     * @deprecated use isChannel
     */
    public isGroup: boolean;
    public isChannel: boolean;
    public argument: string;
    public language: string;
    public targetChannelId: number | undefined;
    /**
     * @deprecated use targetChannelId
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
    public get(value: number | string, offset?: number): Promise<DiscoverySection | DiscoveryPage | Array<Channel> | Array<StoreProductPartial> | Array<Event>>;

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
    public get(value: number | string, offset?: number): Promise<DiscoverySection | DiscoveryPage | Array<Channel> | Array<StoreProductPartial> | Array<Event>>;

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
     * @deprecated use channelId
     */
    public groupId: number;
    public createdBy: number;
    public title: string;
    public category: Number;
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
    public update(eventData: { title: string, startsAt: Date, shortDescription: string, longDescription: string, thumbnail: Buffer }): Promise<Response>;
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
        category: Number;
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
    public members: ChannelMemberList;
    public verificationTier: VerificationTier;
    public roles: ChannelRoleContainer;

    /**
     * @deprecated use inChannel
     */
    public inGroup: boolean;
    public inChannel: boolean;
    public capabilities: Capability;
    public exists: boolean;

    public percentage: string;
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
     * @deprecated use channelId
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
     * @deprecated use channelId
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

export class ChannelMemberList extends BaseModel {
    private constructor(client: WOLF, data: object)

    toJSON(): {
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

export class ChannelRole extends BaseModel {
    private constructor(client: WOLF, data: object, channelId: number);

    public channelId: number;
    public roleId: number;
    public subscriberIdList: Array<number>;
    public maxSeats: number;

    /**
     * Request the profiles of all subscribers with this role
     */
    public subscribers(): Promise<Array<Subscriber>>;
    /**
     * Assign a Channel Role
     * @param subscriberId - The ID of the subscriber
     */
    public assign(subscriberId: number): Promise<Response>;
    /**
     * Reassign a Channel Role
     * @param oldSubscriberId - The ID of the subscriber that currently has the role
     * @param newSubscriberId - The ID of the subscriber to assign the role to
     */
    public reassign(oldSubscriberId: number, newSubscriberId: number): Promise<Response>;
    /**
     * Unassign a Channel Role
     * @param subscriberId - The ID of the subscriber
     */
    public unassign(subscriberId: number): Promise<Response>

    /**
     * Get the roles context
     */
    public role(languageId: Language): Promise<ChannelRoleContext>;

    toJSON(): {
        channelId: number,
        roleId: number,
        subscriberIdList: Array<number>,
        maxSeats: number,
    }
}


export class ChannelRoleContext extends BaseModel {
    private constructor(client: WOLF, data: object, channelId: number);

    public id: number;
    public description: string;
    public emojiUrl: string;
    public hexColour: string;
    public name: string;

    toJSON(): {
        id: number,
        description: string,
        emojiUrl: string,
        hexColour: string,
        name: string
    }
}

export class ChannelRoleMember extends BaseModel {
    private constructor(client: WOLF, data: object, channelId: number);

    public channelId: number;
    public roleId: number;
    public subscriberId: number;

    /**
     * Get the subscribers profile
     */
    public subscriber(): Promise<Subscriber>;
    /**
     * Reassign the Channel Role
     * @param newSubscriberId - The ID of the subscriber to assign the role to
     */
    public reassign(newSubscriberId: number): Promise<Response>;
    /**
     * Unassign the Channel Role
     */
    public unassign(): Promise<Response>

    /**
     * Get the roles context
     */
    public role(languageId: Language): Promise<ChannelRoleContext>;

    toJSON(): {
        channelId: number,
        roleId: number,
        subscriberId: number
    }
}

export class ChannelRoleContainer extends BaseModel {
    private constructor(client: WOLF, channelId: number);

    /**
     * Request the Channel Roles
     * @param forceNew -
     */
    public roles(forceNew: boolean): Promise<Array<ChannelRole>>;
    /**
     * Request the Channel Role Members list
     * @param subscribe -
     * @param forceNew
     */
    public members(subscribe: boolean, forceNew: boolean): Promise<Array<ChannelRoleMember>>;
    /**
     * Assign a Channel Role
     * @param subscriberId - The ID of the subscriber
     * @param roleId - The ID of the role
     */
    public assign(subscriberId: number, roleId: number): Promise<Response>;
    /**
     * Reassign a Channel Role
     * @param oldSubscriberId - The ID of the subscriber that currently has the role
     * @param newSubscriberId - The ID of the subscriber to assign the role to
     * @param roleId - The ID of the role
     */
    public reassign(oldSubscriberId: number, newSubscriberId: number, roleId: number): Promise<Response>;
    /**
     * Unassign a Channel Role
     * @param subscriberId - The ID of the subscriber
     * @param roleId - The ID of the Role
     */
    public unassign(subscriberId: number, roleId: number): Promise<Response>

    toJSON(): {
        members: Array<{
            roleId: number,
            subscriberId: number
        }>,
        roles: Array<{
            roleId: number,
            subscriberIdsList: Array<number>,
            maxSeats: number
        }>
    }
}

export class ChannelStage extends BaseModel {
    private constructor(client: WOLF, data: object, targetChannelId: number)

    public id: number;
    public expireTime: Date;
    public targetChannelId: number;

    /**
     * Set the stage for the channel
     */
    public set(): Promise<Response>;

    toJSON(): {
        id: number,
        expireTime: Date,
        targetChannelId: number
    }
}

export class ChannelStats extends BaseModel {
    private constructor(client: WOLF, data: object)

    public details: ChannelStatsDetail;
    public next30: Array<ChannelStatsActive>;
    public top25: Array<ChannelStatsTop>;
    public topAction: Array<ChannelStatsTop>;
    public topEmoticon: Array<ChannelStatsTop>;
    public topHappy: Array<ChannelStatsTop>;
    public topImage: Array<ChannelStatsTop>;
    public topQuestion: Array<ChannelStatsTop>;
    public topSad: Array<ChannelStatsTop>;
    public topSwear: Array<ChannelStatsTop>;
    public topText: Array<ChannelStatsTop>;
    public topWord: Array<ChannelStatsTop>;
    public trends: Array<ChannelStatsTrend>;
    public trendsDay: Array<ChannelStatsTrend>;
    public trendsHours: Array<ChannelStatsTrend>;

    toJSON(): {

        details: {
            actionCount: number;
            emoticonCount: number;
            id: number;
            happyCount: number;
            imageCOunt: number;
            lineCount: number;
            memberCount: number;
            name: string;
            owner: {
                id: number,
                hash: string,
                nickname: string
            };
            packCount: number;
            questionCount: number;
            spokenCount: number;
            sadCount: number;
            swearCount: number;
            textCount: number;
            voiceCount: number;
            wordCount: number;
            timestamp: number;
        };
        next30: Array<{
            actionCount: number;
            emoticonCount: number;
            channelId: number;
            groupId: number;
            happyEmoticonCount: number;
            imageCount: number;
            lineCount: number;
            message: string;
            nickname: string;
            randomQoute: string;
            packCount: number;
            sadEmoticonCount: number;
            subId: number;
            swearCount: number;
            textCount: number;
            voiceCount: number;
            wordCount: number;
        }>;
        top25: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topAction: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topEmoticon: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topHappy: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topImage: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topQuestion: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topSad: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topSwear: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topText: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        topWord: Array<{
            nickname: string;
            randomQoute: string;
            subId: number;
            value: number;
            percentage: number;
        }>;
        trends: Array<{
            day: number;
            hour: number;
            lineCount: number;
        }>;
        trendsDay: Array<{
            day: number;
            hour: number;
            lineCount: number;
        }>;
        trendsHours: Array<{
            day: number;
            hour: number;
            lineCount: number;
        }>;
    };
}

export class ChannelStatsActive extends BaseModel {
    private constructor(client: WOLF, data: object)

    public actionCount: number;
    public emoticonCount: number;
    public channelId: number;
    /**
     * @deprecated use channelId
     */
    public groupId: number;
    public happyEmoticonCount: number;
    public imageCount: number;
    public lineCount: number;
    public message: string;
    public nickname: string;
    public randomQoute: string;
    public packCount: number;
    public sadEmoticonCount: number;
    public subId: number;
    public swearCount: number;
    public textCount: number;
    public voiceCount: number;
    public wordCount: number;

    /**
     * Get the subscribers profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        actionCount: number;
        emoticonCount: number;
        groupId: number;
        channelId: number;
        happyEmoticonCount: number;
        imageCount: number;
        lineCount: number;
        message: string;
        nickname: string;
        randomQoute: string;
        packCount: number;
        sadEmoticonCount: number;
        subId: number;
        swearCount: number;
        textCount: number;
        voiceCount: number;
        wordCount: number;
    };
}

export class ChannelStatsDetail extends BaseModel {
    private constructor(client: WOLF, data: object)

    public actionCount: number;
    public emoticonCount: number;
    public id: number;
    public happyCount: number;
    public imageCount: number;
    public lineCount: number;
    public memberCount: number;
    public name: string;
    public owner: IdHash;
    public packCount: number;
    public questionCount: number;
    public spokenCount: number;
    public sadCount: number;
    public swearCount: number;
    public textCount: number;
    public voiceCount: number;
    public wordCount: number;
    public timestamp: number;

    toJSON(): {
        actionCount: number;
        emoticonCount: number;
        id: number;
        happyCount: number;
        imageCount: number;
        lineCount: number;
        memberCount: number;
        name: string;
        owner: {
            id: number,
            hash: string,
            nickname: string
        };
        packCount: number;
        questionCount: number;
        spokenCount: number;
        sadCount: number;
        swearCount: number;
        textCount: number;
        voiceCount: number;
        wordCount: number;
        timestamp: number;
    };
}

export class ChannelStatsTop extends BaseModel {
    private constructor(client: WOLF, data: object)

    public nickname: string;
    public randomQuote: string;
    public subId: number;
    public value: number;
    public percentage: number;

    /**
     * Get the subscribers profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        nickname: string;
        randomQuote: string;
        subId: number;
        value: number;
        percentage: number;
    };
}

export class ChannelStatsTrend extends BaseModel {
    private constructor(client: WOLF, data: object)

    public day: number;
    public hour: number;
    public lineCount: number;

    toJSON(): {
        day: number;
        hour: number;
        lineCount: number;
    };
}

export class GroupSubscriberUpdate extends BaseModel {
    private constructor(client: WOLF, data: object)

    /**
     * @deprecated use channelId
     */
    public groupId: number;
    public channelId: number;
    public sourceId: number;
    public targetId: number;
    public action: string;

    /**
     * Get the profile of the group the action was performed in
     * @deprecated use channel
     */
    public group(): Promise<Channel>;
    /**
     * Get the profile of the channel the action was performed in
     */
    public channel(): Promise<Channel>;
    /**
     * Get the profile of the user who performed the action
     */
    public sourceSubscriber(): Promise<Subscriber>;
    /**
     * Get the profile of the user who the action was performed on
     */
    public targetSubscriber(): Promise<Subscriber>;

    toJSON(): {
        groupId: number;
        channelId: number;
        sourceId: number;
        targetId: number;
        action: string;
    };
}

export class IconInfo extends BaseModel {
    private constructor(client: WOLF, data: object)

    public availableSizes: IconInfoAvailableSize;

    /**
     * Get the url for the specified size if it exists, else the closest available
     * @param size - The size
     */
    public get(size: IconSize): string;

    toJSON(): {
        availableTypes: Array<Avatar>,
        availableSizes: {
            small: string;
            medium: string;
            large: string;
            xlarge: string;
        }
    };
}

export class IconInfoAvailableSize extends BaseModel {
    private constructor(client: WOLF, data: object)

    public small: string;
    public medium: string;
    public large: string;
    public xlarge: string;

    /**
     * Get the url for the specified size if it exists, else the closest available
     * @param size - The size
     */
    get(size: IconSize): string;

    toJSON(): {
        small: string;
        medium: string;
        large: string;
        xlarge: string;
    };
}

export class IdHash extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public hash: string;
    public nickname: string;
    public isSubscriber: boolean;

    public subscriber(): Promise<Subscriber>;
    public group(): Promise<Channel>;

    toJSON(): {
        id: number;
        hash: string;
        nickname: string;
    };
}

export class Link extends BaseModel {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public link: string;

    /**
     * Get the link metadata
     */
    public metadata(): Promise<LinkMetadata>;

    toJSON(): {
        start: number;
        end: number;
        link: string;
    };
}

export class LinkMetadata extends BaseModel {
    private constructor(client: WOLF, data: object)

    public description: string;
    public domain: string;
    public imageSize: number;
    public imageUrl: string;
    public isOfficial: boolean;
    public title: string;

    toJSON(): {
        description: string;
        domain: string;
        imageSize: number;
        imageUrl: string;
        isOfficial: boolean;
        title: string;
    };
}

export class Message extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: string;
    public body: string;
    public sourceSubscriberId: number;
    public targetChannelId: number;
    /**
     * @deprecated use targetChannelId
     */
    public targetGroupId: number;
    public embeds: Array<MessageEmbed>;
    public metadata: MessageMetadata;
    /**
     * @deprecated use isChannel instead
     */
    public isGroup: boolean;
    public isChannel: boolean;
    public timestamp: number;
    public edited: MessageEdit;
    public type: MessageType;
    public isCommand: boolean;

    /**
     * Reply to the message
     * @param content - The message
     * @param options - The message send options
     */
    public reply(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    /**
     * Send the subscriber who sent the message a private message
     * @param content - The message
     * @param options - The message send options
     */
    public replyPrivate(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    /**
     * Delete the current message
     */
    public delete(): Promise<Response>;
    /**
     * Restore the current message
     */
    public restore(): Promise<Response>;
    /**
     * Get the edit history for the message
     */
    public getEditHistory(): Promise<Array<MessageUpdate>>
    /**
     * Get the subscriber profile
     */
    public subscriber(): Promise<Subscriber>;
    /**
     * Get the group profile
     * @deprecated use channel
     */
    public group(): Promise<Channel>;
    /**
     * Get the channel profile
     */
    public channel(): Promise<Channel>;
    /**
     * Tip the message
     * @param charm - The charm to tip
     */
    public tip(charm: { id: number, quantity: number } | Array<{ id: number, quantity: number }>): Promise<Response>;

    toJSON(): {
        id: string;
        body: string;
        sourceSubscriberId: number;
        targetChannelId: number;
        targetGroupId: number;
        embeds: Array<{
            type: EmbedType;
            groupId: number;
            channelId: number;
            url: string;
            title: string;
            image: Buffer;
            body: string;
        }>;
        metadata: {
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
            isEdited: boolean;
            isSpam: boolean;
            isTipped: boolean;
        };
        isGroup: boolean;
        isChannel: boolean;
        timestamp: number;
        edited: {
            subscriberId: number;
            timestamp: number;
        };
        type: MessageType;
        isCommand: boolean;
    };
}

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
     * @deprecated use channelId
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
     * @deprecated use channelId
     */
    public groupId: number;
    public channelId: number;

    /**
     * Get the group profile
     * @deprecated use channel
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
        includeEmbeds: boolean,
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

export class MessageUpdate extends BaseModel {
    private constructor(client: WOLF, data: object)

    public data: string;
    public metadata: MessageMetadata;
    public subscriberId: number;
    public timestamp: number;

    /**
     * Get the subscriber profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        data: string;
        metadata: {
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
            isEdited: boolean;
            isSpam: boolean;
            isTipped: boolean;
        };
        subscriberId: number;
        timestamp: number;
    };
}

export class Notification extends BaseModel {
    private constructor(client: WOLF, data: object)

    public context: string;
    public createdAt: Date;
    public expiresAt: Date;
    public feed: NotificationFeed;
    public id: number;
    public notificationId: number;
    public presentationType: string;
    public typeId: number;

    public exists: boolean;
}

export class NotificationFeed extends BaseModel {
    private constructor(client: WOLF, data: object)

    public body: string;
    public imageUrl: string;
    public languageId: Language;
    public link: string;
    public title: string;
}


export class LegacyNotification extends BaseModel {
    private constructor(client: WOLF, data: object)

    public actions: Array<NotificationAction>;
    public endAt: Date;
    public favourite: boolean;
    public global: boolean;
    public id: number;
    public imageUrl: string;
    public layoutType: number;
    public link: string;
    public message: string;
    public metadata: any;
    public newsStreamType: number;
    public persistent: boolean;
    public startsAt: Date;
    public title: string;
    public type: string;

    toJSON(): {
        actions: Array<{
            id: number;
            titleText: string;
            actionurl: string;
            external: boolean;
            imageUrl: string;
        }>;
        endAt: Date;
        favourite: boolean;
        global: boolean;
        id: number;
        imageUrl: string;
        layoutType: number;
        link: string;
        message: string;
        metadata: any;
        newsStreamType: number;
        persistent: boolean;
        startsAt: Date;
        title: string;
        type: string;
    };
}

export class NotificationAction extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public titleText: string;
    public actionUrl: string;
    public external: boolean;
    public imageUrl: string;

    toJSON(): {
        id: number;
        titleText: string;
        actionUrl: string;
        external: boolean;
        imageUrl: string;
    };
}

export class Phrase extends BaseModel {
    private constructor(client: WOLF, data: object)

    public name: string;
    public value: string;
    public language: string;

    toJSON(): {
        name: string;
        value: string;
        language: string;
    };
}

export class PhraseRoute {
    public name: string;
    public language: string;

    toJSON(): {
        name: string;
        language: string;
    }
}

export class PhraseCount extends BaseModel {
    private constructor(client: WOLF, data: object)

    public phrases: number;
    public phrasesPerLanguage: { [key: string]: number }

    toJSON(): {
        phrases: number;
        phrasesPerLanguage: { [key: string]: number }
    };
}

export class Presence extends BaseModel {
    private constructor(client: WOLF, data: object)

    public device: DeviceType;
    public state: OnlineState;
    public lastActive: Date;
    public subscriberId: number;

    /**
     * Get the subscriber profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        device: DeviceType;
        state: OnlineState;
        lastActive: Date;
        subscriberId: number;
    };
}

export class Search extends BaseModel {
    private constructor(client: WOLF, data: object)

    public searchType: SearchType;
    public id: number;
    public hash: string;
    public reason: string;

    /**
     * Get the channel or subscriber profile
     */
    public getProfile(): Promise<Subscriber | Channel>;

    toJSON(): {
        searchType: SearchType;
        id: number;
        hash: string;
        reason: string;
    };
}

export class StageClientDurationUpdate extends BaseModel {
    private constructor(client: WOLF, data: object);

    public targetChannelId: number;
    /**
     * @deprecated use targetChannelId
     */
    public targetGroupId: number;
    public slotId: number;


    /**
     * Play audio on stage
     * @param data - The audio stream
     */
    public play(data: Stream): Promise<void>;
    /**
     * Stop playing audio on a stage (Will remain on stage)
     */
    public stop(): Promise<void>;
    /**
     * Pause the current broadcast (Download continues in background)
     */
    public pause(): Promise<void>;
    /**
     * Resume the current broadcast
     */
    public resume(): Promise<void>;
    /**
     * Leave the slot that bot was on
     */
    public leave(): Promise<Response>;
    /**
     * Get the current broadcast state of the client for a channel
     */
    public getBroadcastState(): Promise<StageBroadcastState>;
    /**
     * Whether or not the client for the channel is ready to broadcast
     */
    public isReady(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is broadcasting
     */
    public isPlaying(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is paused
     */
    public isPaused(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is idling
     */
    public isIdle(): Promise<boolean>;
    /**
     * Get the duration of the current broadcast
     */
    public duration(): Promise<number>;
    /**
     * Get the slot the bot is on
     */
    public getSlotId(): Promise<number>;

    toJSON(): {
        targetGroupId: number,
        targetChannelId: number,
        duration: number;
    }
}

export class StageClientGeneralUpdate extends BaseModel {
    private constructor(client: WOLF, data: object);

    public targetChannelId: number;
    /**
     * @deprecated use targetChannelId
     */
    public targetGroupId: number;
    public sourceSubscriberId: number;
    public slotId: number;

    /**
     * Play audio on stage
     * @param data - The audio stream
     */
    public play(data: Stream): Promise<void>;
    /**
     * Stop playing audio on a stage (Will remain on stage)
     */
    public stop(): Promise<void>;
    /**
     * Pause the current broadcast (Download continues in background)
     */
    public pause(): Promise<void>;
    /**
     * Resume the current broadcast
     */
    public resume(): Promise<void>;
    /**
     * Leave the slot that bot was on
     */
    public leave(): Promise<Response>;
    /**
     * Get the current broadcast state of the client for a channel
     */
    public getBroadcastState(): Promise<StageBroadcastState>;
    /**
     * Whether or not the client for the channel is ready to broadcast
     */
    public isReady(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is broadcasting
     */
    public isPlaying(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is paused
     */
    public isPaused(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is idling
     */
    public isIdle(): Promise<boolean>;
    /**
     * Get the duration of the current broadcast
     */
    public duration(): Promise<number>;
    /**
     * Get the slot the bot is on
     */
    public getSlotId(): Promise<number>;

    toJSON(): {
        targetGroupId: number;
        targetChannelId: number;
        sourceSubscriberId: number;
    }
}

export class StageClientViewerCountUpdate extends BaseModel {
    private constructor(client: WOLF, data: object);

    public targetChannelId: number;
    /**
     * @deprecated use targetChannelId
     */
    public targetGroupId: number;
    public slotId: number;

    public oldBroadcasterCount: number;
    public newBroadcasterCount: number;
    public oldConsumerCount: number;
    public newConsumerCount: number;

    /**
     * Play audio on stage
     * @param data - The audio stream
     */
    public play(data: Stream): Promise<void>;
    /**
     * Stop playing audio on a stage (Will remain on stage)
     */
    public stop(): Promise<void>;
    /**
     * Pause the current broadcast (Download continues in background)
     */
    public pause(): Promise<void>;
    /**
     * Resume the current broadcast
     */
    public resume(): Promise<void>;
    /**
     * Leave the slot that bot was on
     */
    public leave(): Promise<Response>;
    /**
     * Get the current broadcast state of the client for a channel
     */
    public getBroadcastState(): Promise<StageBroadcastState>;
    /**
     * Whether or not the client for the channel is ready to broadcast
     */
    public isReady(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is broadcasting
     */
    public isPlaying(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is paused
     */
    public isPaused(): Promise<boolean>;
    /**
     * Whether or not the client for the channel is idling
     */
    public isIdle(): Promise<boolean>;
    /**
     * Get the duration of the current broadcast
     */
    public duration(): Promise<number>;
    /**
     * Get the slot the bot is on
     */
    public getSlotId(): Promise<number>;

    toJSON(): {
        targetChannelId: number;
        targetGroupId: number;
        oldBroadcasterCount: number;
        newBroadcasterCount: number;
        oldConsumerCount: number;
        newConsumerCount: number;
    }
}

export class Store extends BaseModel {
    private constructor(client: WOLF, data: object, languageId: Language)

    public id: number;
    public title: string;
    public languageId: Language;
    public credits: Array<StoreProductCredits>;
    public sections: Array<StoreSection>;

    /**
     * Get a page or section
     * @param value - The page or ID
     * @param offset - The product or page offset
     */
    public get(value: number | string, offset?: number): Promise<StoreSection | StorePage | Array<StoreProductPartial>>;

    /**
     * Get the available credit list
     */
    public getCreditList(): Promise<Array<StoreProductCredits>>;

    toJSON(): {
        id: number;
        title: string;
        languageId: Language;
        credits: Array<{
            id: number;
            credits: number;
            code: string;
            imageUrl: string;
            name: string;
            description: string;
        }>;
        sections: Array<{
            id: number;
            languageId: Language;
            validity: {
                fromTime: Date;
                endTime: Date;
            };

            title: string;
            images: Array<string>
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

export class StorePage extends BaseModel {
    private constructor(client: WOLF, data: object, languageId: Language)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<StoreSection>;

    /**
     * Get a page or section
     * @param value - Page Name, ID
     * @param offset - Product or page offset
     */
    public get(value: number | string, offset?: number): Promise<StoreSection | StorePage | Array<StoreProductPartial>>;

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

            title: string;
            images: Array<string>
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

export class StoreProduct extends BaseModel {
    private constructor(client: WOLF, data: object, languageId: Language)

    public languageId: Language;
    public id: number;
    public durationList: Array<StoreProductDuration>;
    public extraInfo: number;
    public heroImageUrl: string;
    public imageList: Array<StoreProductImage>;
    public isLimited: boolean;
    public isRemoved: boolean;
    public isStocked: boolean;
    public name: string;
    public promotionText: string;
    public recipeId: number;
    public reputationLevel: number;
    public targetType: string;
    public typeId: number;
    public userLevel: number;
    public webContentUrl: string;

    /**
     * Purchase an item
     * @param duration - The duration ID
     * @param quantity - How many to buy
     * @param targetChannelIds - The target user or channel IDs
     */
    public purchase(duration: StoreProductDuration | number, quantity: number, targetChannelIds: number | Array<number>): Promise<Response>;
    /**
     * Purchase an item
     * @param quantity - How many to buy
     * @param targetChannelIds - The target user or channel IDs
     */
    public purchase(quantity: number, targetChannelIds: number | Array<number>): Promise<Response>;

    toJSON(): {
        languageId: Language;
        id: number;
        durationList: Array<{
            id: number;
            days: number;
            credits: number;
        }>;
        extraInfo: number;
        heroImageUrl: string;
        imageList: Array<{
            url: string
        }>;
        isLimited: boolean;
        isRemoved: boolean;
        isStocked: boolean;
        name: string;
        promotionText: string;
        recipeId: number;
        reputationLevel: number;
        targetType: string;
        typeId: number;
        userLevel: number;
        webContentUrl: string;
    };
}

export class StoreProductCredits extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public credits: number;
    public code: string;
    public imageUrl: string;
    public name: string;
    public description: string;

    toJSON(): {
        id: number;
        credits: number;
        code: string;
        imageUrl: string;
        name: string;
        description: string;
    };
}

export class StoreProductDuration extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public days: number;
    public credits: number;

    /**
     * Purchase an item
     * @param quantity - How many to buy
     * @param targetChannelIds - The target user or channel IDs
     */
    public purchase(quantity: number, targetChannelIds: number | Array<number>): Promise<Response>;

    toJSON(): {
        id: number;
        days: number;
        credits: number;
    };
}

export class StoreProductImage extends BaseModel {
    private constructor(client: WOLF, data: object)

    public url: string;

    toJSON(): {
        url: string
    };
}

export class StoreProductPartial extends BaseModel {
    private constructor(client: WOLF, data: object, languageId: Language)

    public credits: number;
    public id: number;
    public languageId: Language;
    public imageUrl: string;
    public isLimited: boolean;
    public name: string;
    public promotionText: string;
    public reputationLevel: number;
    public targetType: string;
    public charmId: number;
    public botId: number;

    /**
     * Get a products full profile
     * @param languageId - The language
     */
    public getFullProduct(languageId?: Language): Promise<StoreProduct>;

    toJSON(): {
        credits: number;
        id: number;
        languageId: Language;
        imageUrl: string;
        isLimited: boolean;
        name: string;
        promotionText: string;
        reputationLevel: number;
        targetType: string;
        charmId: number;
        botId: number;
    };
}

export class StoreSection extends BaseModel {
    private constructor(client: WOLF, data: object, languageId: Language, fromSubPage: boolean)

    public id: number;
    public languageId: Language;
    public validity: Validity;

    public title: string;
    public images: Array<string>
    public description: string;
    public videos: Array<TopicSectionVideo>;
    public additionalDescriptions: Array<string>

    /**
     * Get the page or products on the store section
     * @param offset - Page or product ID offset
     */
    public get(offset?: number): Promise<StorePage | Array<StoreProductPartial>>;

    toJSON(): {
        id: number;
        languageId: Language;
        validity: {
            fromTime: Date;
            endTime: Date;
        };

        title: string;
        images: Array<string>
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
    };
}

export class Subscriber extends BaseModel {
    private constructor(client: WOLF, data: object)

    public charms: SubscriberSelectedCharm;
    public deviceType: DeviceType;
    public extended: SubscriberExtended;
    public hash: string;
    public icon: number;
    public iconHash: string;
    public iconInfo: IconInfo;
    public id: number;
    public nickname: string;
    public onlineState: OnlineState;
    public reputation: number;
    public privileges: Privilege;
    public privilegeList: Array<Privilege>;
    public status: string;
    public language: string;

    public exists: boolean;

    public percentage: number;

    /**
     * Get the subscribers avatar URL
     * @param size - The size
     */
    public getAvatarUrl(size: IconSize): string;
    /**
     * Get the subscribers avatar
     * @param size - The size
     */
    public getAvatar(size: IconSize): Promise<Buffer>;

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
     * Delete subscriber as a contact
     */
    public delete(): Promise<Response>;
    /**
     * Send a message to the subscriber
     * @param content - The message
     * @param options - The message send options
     */
    public sendMessage(content: string | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;

    /**
     * Update the bots profile
     * @param profileData - The new profile data
     */
    public update(profileData: { nickname: string, status: string, dateOfBirth: Date, about: string, gender: Gender, language: Language, lookingFor: LookingFor, name: string, relationship: Relationship, urls: Array<string>, avatar: Buffer }): Promise<Response>;

    toJSON(): {
        charms: SubscriberSelectedCharm;
        deviceType: DeviceType;
        extended: {
            dateOfBirth: Date,
            about: string;
            gender: Gender;
            language: Language;
            lookingFor: LookingFor;
            /**
             * @deprecated use lookingForList
             */
            lookingForExtended: Array<LookingFor>;
            lookingForList: Array<LookingFor>;
            name: string;
            relationship: Relationship;
            urls: Array<string>;
            utcOffset: number;
        };
        hash: string;
        icon: number;
        iconHash: string;
        iconInfo: {
            availableTypes: Array<Avatar>,
            availableSizes: {
                small: string;
                medium: string;
                large: string;
                xlarge: string;
            }
        };
        id: number;
        nickname: string;
        onlineState: OnlineState;
        reputation: number;
        privileges: Privilege;
        privilegeList: Array<Privilege>;
        status: string;
        language: string;

        exists: boolean;
        subscribed: boolean;
        percentage: number;
    };

    /**
     * Subscribe to profile updates
     */
    public subscribe(): Promise<Subscriber>;
    /**
     * Unsubscribe from profile updates
     */
    public unsubscribe(): Promise<Response>;
}

export class SubscriberEvent extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    /**
     * @deprecated use channelId
     */
    public groupId: number;
    public channelId: number;
    public additionalInfo: SubscriberEventAdditionalInfo;

    /**
     * Get an event profile
     */
    public get(): Promise<Event>;
    /**
     * Add an event to the bots subscription list
     */
    public subscribe(): Promise<Response>;
    /**
     * Remove an event from the bots subscription list
     */
    public unsubscribe(): Promise<Response>;

    toJSON(): {
        id: number;
        groupId: number;
        channelId: number;
        additionalInfo: {
            eTag: string;
            endsAt: Date;
            startsAt: Date;
        };
    };
}

export class SubscriberEventAdditionalInfo extends BaseModel {
    private constructor(client: WOLF, data: object)

    public eTag: string;
    public endsAt: Date;
    public startsAt: Date;

    toJSON(): {
        eTag: string;
        endsAt: Date;
        startsAt: Date;
    };
}

export class SubscriberExtended extends BaseModel {
    private constructor(client: WOLF, data: object)
    public about: string;
    public dateOfBirth: Date;
    public gender: Gender;
    public language: Language;
    public lookingFor: LookingFor;
    public lookingForExtended: Array<LookingFor>;
    /**
     * @deprecated use lookingForList
     */
    public lookingForList: Array<LookingFor>;
    public name: string;
    public relationship: Relationship;
    public urls: Array<string>;
    public utcOffset: number;

    toJSON(): {
        about: string;
        gender: Gender;
        language: Language;
        lookingFor: LookingFor;
        /**
         * @deprecated use lookingForList
         */
        lookingForExtended: Array<LookingFor>;
        lookingForList: Array<LookingFor>;
        name: string;
        relationship: Relationship;
        urls: Array<string>;
        utcOffset: number;
    };
}

export class SubscriberSelectedCharm extends BaseModel {
    private constructor(client: WOLF, data: object)

    public selectedList: Array<CharmSelected>;

    /**
     * Set the charm displayed on the profile
     * @param charm - The new charms to set
     */
    public set(charm: CharmSelectedBuilder | Array<CharmSelectedBuilder>): Promise<Response>;
    /**
     * Clear the selected charm being displayed on the profile
     */
    public clear(): Promise<Response>;

    toJSON(): {
        selectedList: Array<{
            charmId: number;
            position: number;
        }>
    };
}

export class TimerJob extends BaseModel {
    private constructor(client: WOLF, data: object)

    public handler: string;
    public data: Object;
    public duration: number;
    public timestamp: number;
    public id: string;
    public remaining: number;

    /**
     * Cancel an event
     */
    cancel(): Promise<void>;
    /**
     * Change the time event time
     * @param duration - How long to wait
     */
    delay(duration: number): Promise<void>

    toJSON(): {
        handler: string;
        data: Object;
        duration: number;
        timestamp: number;
        id: string;
        remaining: number;
    };
}

export class Tip extends BaseModel {
    private constructor(client: WOLF, data: object)

    public charmList: Array<TipCharm>;
    public channelId: number;
    /**
     * @deprecated use channelId
     */
    public groupId: number;
    /**
    * @deprecated use isChannel instead
    */
    public isGroup: boolean;
    public isChannel: boolean;
    public sourceSubscriberId: number;
    public subscriberId: number;
    public context: TipContext;

    /**
     * Get all the charms tipped
     */
    public charms(): Promise<Array<Charm>>;
    /**
     * Get the group the tip happened in
     * @deprecated use channel
     */
    public group(): Promise<Channel>;
    /**
     * Get the channel the tip happened in
     */
    public channel(): Promise<Channel>;
    /**
     * Get the subscriber who tipped
     */
    public sourceSubscriber(): Promise<Subscriber>;
    /**
     * Get the subscriber that was tipped
     */
    public targetSubscriber(): Promise<Subscriber>;

    toJSON(): {
        charmList: Array<{
            id: number;
            quantity: number;
            credits: number;
            magnitude: number;
            subscriber: {
                id: number,
                hash: string,
                nickname: string | undefined,
            };
        }>;
        groupId: number;
        channelId: number;
        isGroup: boolean;
        isChannel: boolean;
        sourceSubscriberId: number;
        subscriberId: number;
        context: {
            type: ContextType;
            id: number;
        };
    };
}

export class TipCharm extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public quantity: number;
    public credits: number;
    public magnitude: number;
    public subscriber: IdHash;

    /**
     * Get the charm
     */
    public charm(): Promise<Charm>;

    toJSON(): {
        id: number;
        quantity: number;
        credits: number;
        magnitude: number;
        subscriber: {
            id: number,
            hash: string,
            nickname: string | undefined,
        };
    };
}

export class TipContext extends BaseModel {
    private constructor(client: WOLF, data: object)

    public type: ContextType;
    public id: number;

    toJSON(): {
        type: ContextType;
        id: number;
    };
}

export class TipDetail extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public list: Array<TipCharm>;
    public version: number;

    /**
     * Get the tipped charm
     */
    public charms(): Promise<Array<Charm>>;

    toJSON(): {
        id: number;
        list: Array<{
            id: number;
            quantity: number;
            credits: number;
            magnitude: number;
            subscriber: {
                id: number,
                hash: string,
                nickname: string | undefined,
            };
        }>;
        version: number;
    };
}

export class TipLeaderboard extends BaseModel {
    private constructor(client: WOLF, data: object)

    public leaderboard: Array<TipLeaderboardItem>;

    toJSON(): {
        leaderboard: Array<{
            rank: number;
            charmId: number;
            quantity: number;
            credits: number;
            group: {
                id: number,
                hash: string,
                nickname: string | undefined,
            };
            subscriber: {
                id: number,
                hash: string,
                nickname: string | undefined,
            };
        }>
    };
}

export class TipLeaderboardItem extends BaseModel {
    private constructor(client: WOLF, data: object)

    public rank: number;
    public charmId: number;
    public quantity: number;
    public credits: number;
    /**
     * @deprecated use channel
     */
    public group: IdHash;
    public channel: IdHash;
    public subscriber: IdHash;

    /**
     * Get the charm
     */
    public charm(): Promise<Charm>;

    toJSON(): {
        rank: number;
        charmId: number;
        quantity: number;
        credits: number;
        group: {
            id: number,
            hash: string,
            nickname: string | undefined,
        };
        channel: {
            id: number,
            hash: string,
            nickname: string | undefined,
        };
        subscriber: {
            id: number,
            hash: string,
            nickname: string | undefined,
        };
    };
}

export class TipLeaderboardSummary extends BaseModel {
    private constructor(client: WOLF, data: object)

    public topGifters: Array<IdHash>;
    /**
     * @deprecated use topChannels
     */
    public topGroups: Array<IdHash>;
    public topChannels: Array<IdHash>;
    public topSpenders: Array<IdHash>;

    toJSON(): {
        topGifters: Array<{
            id: number,
            hash: string,
            nickname: string | undefined,
        }>;
        topGroups: Array<{
            id: number,
            hash: string,
            nickname: string | undefined,
        }>;
        topChannels: Array<{
            id: number,
            hash: string,
            nickname: string | undefined,
        }>;
        topSpenders: Array<{
            id: number,
            hash: string,
            nickname: string | undefined,
        }>;
    };
}

export class TipSummary extends BaseModel {
    private constructor(client: WOLF, data: object)

    public id: number;
    public charmList: Array<TipCharm>;
    public version: number;

    /**
     * Get all charms tipped
     */
    public charms(): Promise<Array<Charm>>;

    toJSON(): {
        id: number;
        charmList: Array<{
            id: number;
            quantity: number;
            credits: number;
            magnitude: number;
            subscriber: {
                id: number,
                hash: string,
                nickname: string | undefined,
            };
        }>;
        version: number;
    };
}

export class TopicSectionVideo extends BaseModel {
    private constructor(client: WOLF, data: object)

    public aspect: TopicSectionVideoAspect;
    public autoplay: boolean;
    public loop: boolean;
    public muted: boolean;
    public url: string;

    toJSON(): {
        aspect: {

            width: number;
            height: number;
        };
        autoplay: boolean;
        loop: boolean;
        muted: boolean;
        url: string;
    };
}

export class TopicSectionVideoAspect extends BaseModel {
    private constructor(client: WOLF, data: object)

    public width: number;
    public height: number;

    toJSON(): {
        width: number;
        height: number;
    };
}

export class Translation extends BaseModel {
    private constructor(client: WOLF, data: object)

    public languageId: Language;
    public text: string;

    toJSON(): {
        languageId: Language;
        text: string;
    };
}

export class Validity extends BaseModel {
    private constructor(client: WOLF, data: object)

    public fromTime: Date;
    public endTime: Date;

    toJSON(): {
        fromTime: Date;
        endTime: Date;
    };
}

export class ValidUrl extends BaseModel {
    private constructor(client: WOLF, data: object)

    public url: string;
    public hostname: string;

    toJSON(): {
        url: string;
        hostname: string;
    };
}

export class Welcome extends BaseModel {
    private constructor(client: WOLF, data: object)

    public ip: string;
    public token: string;
    public country: string;
    public endpointConfig: WelcomeEndpoint;
    public subscriber: Subscriber;

    toJSON(): {
        ip: string;
        token: string;
        country: string;
        endpointConfig: {
            avatarEndpoint: string;
            mmsUploadEndpoint: string;
        };
        subscriber: Subscriber;
    };
}

export class WelcomeEndpoint extends BaseModel {
    private constructor(client: WOLF, data: object)

    public avatarEndpoint: string;
    public mmsUploadEndpoint: string;

    toJSON(): {
        avatarEndpoint: string;
        mmsUploadEndpoint: string;
    };
}

export class WOLFAPIError extends Error {
    private constructor(error: Error, param)

    public params: any
}

export class WolfstarsProfile extends BaseModel {
    private constructor(client: WOLF, data: object)

    public maxListeners: number;
    public shows: number;
    public subscriberId: number;
    public talentList: Array<WolfstarTalent>;
    public totalListeners: number;
    public exists: boolean;

    /**
     * Get the subscriber linked to the wolfstar profile
     */
    public subscriber(): Promise<Subscriber>;

    toJSON(): {
        maxListeners: number;
        shows: number;
        subscriberId: number;
        talentList: Array<WolfstarTalent>;
        totalListeners: number;
        exists: boolean;

    };
}

//#endregion

//#region Constants

export const Constants: {
    AdminAction: AdminAction;
    Avatar: Avatar,
    Capability: Capability;
    Category: Category;
    ContextType: ContextType;
    DeviceType: DeviceType;
    EmbedType: EmbedType;
    Gender: Gender;
    IconSize: IconSize,
    Language: Language;
    LoginType: LoginType;
    LookingFor: LookingFor;
    MemberListType: MemberListType,
    MessageFilterTier: MessageFilterTier;
    MessageType: MessageType;
    OnlineState: OnlineState;
    Privilege: Privilege;
    Relationship: Relationship;
    SearchType: SearchType;
    StageBroadcastState: StageBroadcastState;
    StageConnectionState: StageConnectionState;
    TipDirection: TipDirection;
    TipPeriod: TipPeriod;
    TipType: TipType;
    TopicPageRecipeType: TopicPageRecipeType;
    VerificationTier: VerificationTier,
    WolfstarTalent: WolfstarTalent;
}

export enum AdminAction {
    REGULAR = 0,
    ADMIN = 1,
    MOD = 2,
    BAN = 4,
    SILENCE = 8,
    KICK = 16,
    JOIN = 17,
    LEAVE = 18,
    OWNER = 32,
}

export enum Avatar {
    GIF = 'gif',
    JPG = 'jpg',
    JPEG = 'jpeg',
    M4A = 'm4a',
    MP4 = 'mp4'
}

export enum Capability {
    NOT_MEMBER = -1,
    REGULAR = 0,
    ADMIN = 1,
    MOD = 2,
    BANNED = 4,
    SILENCED = 8,
    OWNER = 32,
}

export enum Category {
    NOT_SPECIFIED = 0,
    BUSINESS = 8,
    EDUCATION = 10,
    ENTERTAINMENT = 26,
    GAMING = 12,
    LIFESTYLE = 13,
    MUSIC = 14,
    NEWS_AND_POLITICS = 15,
    PHOTOGRAPHY = 16,
    SCIENCE_AND_TECH = 25,
    SOCIAL_AND_PEOPLE = 17,
    SPORTS = 19,
    TRAVEL_AND_LOCAL = 18,
}

export enum ContextType {
    MESSAGE = "message",
    STAGE = "stage",
}

export enum DeviceType {
    OTHER = 0,
    BOT = 1,
    IPHONE = 5,
    IPAD = 6,
    ANDROID = 7,
    WEB = 8,
    VR = 11,
}

export enum EmbedType {
    IMAGE_PREVIEW = "imagePreview",
    /**
     * @deprecated use CHANNEL_PREVIEW
     */
    GROUP_PREVIEW = "groupPreview",
    CHANNEL_PREVIEW = "groupPreview",
    LINK_PREVIEW = "linkPreview",
}

export enum Gender {
    NOT_SPECIFIED = 0,
    MALE = 1,
    FEMALE = 2,
}

export enum IconSize {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    XLARGE = "xlarge"
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
    BULGARIAN = 45,
}

export enum LogLevel {
    OFF = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}

export enum LoginType {
    EMAIL = "email",
    GOOGLE = "google",
    FACEBOOK = "facebook",
    TWITTER = "twitter",
    SNAPCHAT = "snapchat",
    APPLE = "apple",
}

export enum LookingFor {
    NOT_SPECIFIED = 0,
    FRIENDSHIP = 1,
    DATING = 2,
    RELATIONSHIP = 4,
    NETWORKING = 8,
}

export enum MemberListType {
    PRIVILEGED = "privileged",
    REGULAR = "regular",
    SILENCED = "silenced",
    BANNED = "banned",
    BOTS = "bots",
    MISCELLANEOUS = "miscellaneous"
}

export enum MessageFilterTier {
    OFF = 0,
    RELAXED = 3,
    RECOMMENDED = 2,
    STRICT = 1,
}

export enum MessageType {
    TEXT_PLAIN = "text/plain",
    TEXT_HTML = "text/html",
    TEXT_IMAGE = "text/image_link",
    IMAGE_JPEG = "image/jpeg",
    IMAGE_GIF = "image/gif",
    AUDIO_AAC = "audio/aac",
    TEXT_VOICE = "text/voice_link",
    AUDIO_SPEEX = "audio/x-speex",
    IMAGE_JPEGHTML = "image/jpeghtml",
    /**
     * @deprecated use APPLICATION_PALRINGO_CHANNEL_ACTION
     */
    APPLICATION_PALRINGO_GROUP_ACTION = "application/palringo-group-action",
    APPLICATION_PALRINGO_CHANNEL_ACTION = "application/palringo-group-action",
    APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK = "application/palringo-interactive-message-pack",
    TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE = "text/palringo-private-request-response",
}

export enum OnlineState {
    OFFLINE = 0,
    ONLINE = 1,
    AWAY = 2,
    INVISIBLE = 3,
    BUSY = 5,
    IDLE = 9,
}

export enum Privilege {
    SUBSCRIBER = 1,
    BOT_TESTER = 2,
    HOST = 4,
    CONTENT_SUBMITER = 8,
    SELECTCLUB_1 = 16,
    ELITECLUB_1 = 64,
    RANK_1 = 128,
    VOLUNTEER = 512,
    SELECTCLUB_2 = 1024,
    ALPHA_TESTER = 2048,
    STAFF = 4096,
    DJ = 8192,
    DEVELOPER = 16384,
    ELITECLUB_2 = 131072,
    WELCOMER = 262144,
    VALID_EMAIL = 524288,
    PREMIUM_ACCOUNT = 1048576,
    WOLF_STAR = 2097152,
    WOLF_STAR_PRO = 8388608,
    ELITECLUB_3 = 4194304,
    USER_ADMIN = 16777216,
    GROUP_ADMIN = 33554432,
    BOT = 67108864,
    ENTERTAINER = 536870912,
    SHADOW_BANNED = 1073741824,
}

export enum Relationship {
    NOT_SPECIFIED = 0,
    SINGLE = 1,
    RELATIONSHIP = 2,
    ENGAGED = 3,
    MARRIED = 4,
    COMPLICATED = 5,
    OPEN = 6,
}

export enum SearchType {
    /**
     * @deprecated use CHANNEL
     */
    GROUP = "group",
    CHANNEL = "group",
    SUBSCRIBER = "subscriber",
}

export enum StageBroadcastState {
    IDLE = 0,
    PLAYING = 1,
    PAUSED = 2
}

export enum StageConnectionState {
    INITIALISING = "initialising",
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    READY = "ready"
}

export enum TipDirection {
    SENT = "sent",
    RECEIVED = "received",
}

export enum TipPeriod {
    ALL_TIME = "alltime",
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
}

export enum TipType {
    CHARM = "charm",
    SUBSCRIBER = "subscriber",
    /**
     * @deprecated use CHANNEL
     */
    GROUP = "group",
    CHANNEL = "group",
}

export enum TopicPageRecipeType {
    EVENT = "event",
    /**
     * @deprecated use CHANNEL
     */
    GROUP = "group",
    CHANNEL = "group",
    PRODUCT = "product"
}

export enum VerificationTier {
    NONE = 'none',
    PREMIUM = 'premium',
    VERIFIED = 'verified'
}

export enum WolfstarTalent {
    MUSIC = 1,
    ENTERTAINMENT = 2,
    TALK_SHOW = 3,
    STORY_TELLING = 4,
    VOICE_OVER = 5,
    POETRY = 6,
    COMEDY = 7,
    IMITATING_VOICES = 8,
}

//#endregion

//#region Client events

export interface ClientEvents {

    /**
     * Client connected to the server
     */
    connected: [],
    /**
     * Client is connecting to the server
     */
    connecting: [],
    /**
     * Client encountered an occurred while connecting to the server
     */
    connectError: [error: Error],
    /**
     * Client encountered a timeout while connecting to the server
     */
    connectTimeout: [error: Error],
    /**
     * Client disconnected from the server
     */
    disconnected: [reason: string],
    /**
     * An websocket error occurred
     */
    error: [error: Error],
    /**
     * Fires when a global notification has been received
     */
    globalNotificationAdd: [notification: Notification],
    /**
     * Fires when the global notification list has been cleared
     */
    globalNotificationClear: [],
    /**
     * Fires when a global notification has been deleted
     */
    globalNotificationDelete: [notification: Notification],
    /**
     * Fires when a group audio count updates
     * @deprecated use channelAudioCountUpdate
     */
    groupAudioCountUpdate: [oldCounts: ChannelAudioCounts, newCounts: ChannelAudioCounts],
    /**
     * Fires when a channel audio count updates
     */
    channelAudioCountUpdate: [oldCounts: ChannelAudioCounts, newCounts: ChannelAudioCounts],
    /**
     * Fired when a group audio request is added
     * @deprecated use channelAudioRequestAdd
     */
    groupAudioRequestAdd: [request: ChannelAudioSlotRequest],
    /**
     * Fired when a channel audio request is added
     */
    channelAudioRequestAdd: [request: ChannelAudioSlotRequest],
    /**
     * Fired when a group audio request list is cleared
     * @deprecated use channelAudioRequestListClear
     */
    groupAudioRequestListClear: [group: Channel, subscriberId: number],
    /**
     * Fired when a channel audio request list is cleared
     */
    channelAudioRequestListClear: [channel: Channel, subscriberId: number],
    /**
     * Fired when a group audio request is deleted
     * @deprecated use channelAudioRequestDelete
     */
    groupAudioRequestDelete: [group: Channel, request: ChannelAudioSlotRequest],
    /**
     * Fired when a channel audio request is deleted
     */
    channelAudioRequestDelete: [channel: Channel, request: ChannelAudioSlotRequest],
    /**
     * Fired when a group audio request expires
     * @deprecated use channelAudioRequestExpire
     */
    groupAudioRequestExpire: [group: Channel, request: ChannelAudioSlotRequest],
    /**
     * Fired when a channel audio request expires
     */
    channelAudioRequestExpire: [channel: Channel, request: ChannelAudioSlotRequest],
    /**
     * Fired when a group audio slot is updated
     * @deprecated use channelAudioSlotUpdate
     */
    groupAudioSlotUpdate: [oldSlot: ChannelAudioSlot, newSlot: ChannelAudioSlotUpdate],
    /**
     * Fired when a channel audio slot is updated
     */
    channelAudioSlotUpdate: [oldSlot: ChannelAudioSlot, newSlot: ChannelAudioSlotUpdate],
    /**
     * Fired when a groups audio configuration is updated
     * @deprecated use channelAudioUpdate
     */
    groupAudioUpdate: [oldConfig: ChannelAudioConfig, newConfig: ChannelAudioConfig],
    /**
     * Fired when a channels audio configuration is updated
     */
    channelAudioUpdate: [oldConfig: ChannelAudioConfig, newConfig: ChannelAudioConfig],
    /**
     * Fired when a group event is created
     * @deprecated use channelEventCreate
     */
    groupEventCreate: [group: Channel, event: Event],
    /**
     * Fired when a channel event is created
     */
    channelEventCreate: [channel: Channel, event: Event],
    /**
     * Fired when a group event is deleted
     * @deprecated use channelEventDelete
     */
    groupEventDelete: [group: Channel, event: Event],
    /**
     * Fired when a channel event is deleted
     */
    channelEventDelete: [channel: Channel, event: Event],
    /**
     * Fired when a group event is updated
     * @deprecated use channelEventUpdate
     */
    groupEventUpdate: [group: Channel, oldEvent: Event, newEvent: Event],
    /**
     * Fired when a channel event is updated
     */
    channelEventUpdate: [channel: Channel, oldEvent: Event, newEvent: Event],
    /**
     * Fired when a group member joins
     * @deprecated use channelMemberAdd
     */
    groupMemberAdd: [group: Channel, subscriber: Subscriber],
    /**
     * Fired when a channel member joins
     */
    channelMemberAdd: [channel: Channel, subscriber: Subscriber],
    /**
     * Fired when a group member leaves
     * @deprecated use channelMemberDelete
     */
    groupMemberDelete: [group: Channel, subscriber: Subscriber],
    /**
     * Fired when a channel member leaves
     */
    channelMemberDelete: [channel: Channel, subscriber: Subscriber],
    /**
     * Fired when a group member is updated
     * @deprecated use channelMemberUpdate
     */
    groupMemberUpdate: [group: Channel, update: GroupSubscriberUpdate],
    /**
     * Fired when a channel member is updated
     */
    channelMemberUpdate: [channel: Channel, update: GroupSubscriberUpdate],
    /**
     * Fired when a group message is received
     * @deprecated use channelMessage
     */
    groupMessage: [message: Message],
    /**
     * Fired when a channel message is received
     */
    channelMessage: [message: Message],
    /**
     * Fired when a group message is updated
     * @deprecated use channelMessageUpdate
     */
    groupMessageUpdate: [message: Message],
    /**
     * Fired when a channel message is updated
     */
    channelMessageUpdate: [message: Message],
    /**
     * Fired when a group member has a Channel Role added
     */
    channelRoleAssign: [channel: Channel, channelRoleMember: ChannelRoleMember],
    /**
     * Fired when a group member has a Channel Role removed
     */
    channelRoleUnassign: [channel: Channel, channelRoleMember: ChannelRoleMember],
    /**
     * Fired when a group message is tipped
     * @deprecated use channelTipAdd
     */
    groupTipAdd: [tip: Tip],
    /**
     * Fired when a channel message is tipped
     */
    channelTipAdd: [tip: Tip],
    /**
     * Fired when a group profile is updated
     * @deprecated use channelUpdate
     */
    groupUpdate: [oldGroup: Channel, newGroup: Channel],
    /**
     * Fired when a channel profile is updated
     */
    channelUpdate: [oldChannel: Channel, newChannel: Channel],
    /**
     * Fired when an internal framework error occurs
     */
    internalError: [error: Error],
    /**
     * Fires when the bot joins a group
     * @deprecated use joinedChannel
     */
    joinedGroup: [group: Channel, subscriber: Subscriber],
    /**
     * Fires when the bot joins a channel
     */
    joinedChannel: [channel: Channel, subscriber: Subscriber],
    /**
     * Fires when the bot leaves a group
     * @deprecated use leftChannel
     */
    leftGroup: [group: Channel, subscriber: Subscriber],
    /**
     * Fires when the bot leaves a channel
     */
    leftChannel: [channel: Channel, subscriber: Subscriber],
    /**
     * Fires when a log is saved
     */
    log: [{ level: LogLevel, message: string }],
    /**
     * Fires when login fails
     */
    loginFailed: [response: Response<any>],
    /**
     * Fires when login succeeds
     */
    loginSuccess: [subscriber: Subscriber],
    /**
     * Fires when a notification is received
     * @deprecated use newer notification methods & events.
     */
    notificationReceived: [Notification: LegacyNotification | Notification],
    /**
     * Fires when a packet is received from the server
     */
    packetReceived: [eventString: string, data: object],
    /**
     * Fires when a packet is sent to the server
     */
    packetSent: [command: string, body: object],
    /**
     * Fires when a packet response was not within the range of success upon retry (if failing code is retryable)
     */
    packetFailed: [command: string, body: object],
    /**
     * Fires when a packet response was a failing code and was retryable
     */
    packetRetry: [command: string, body: object, attempt: number],
    /**
     * Fires when the server pings
     */
    ping: [],
    /**
     * Fires when the client pongs
     */
    pong: [latency: number],
    /**
     * Fires when a subscribers presence updates
     */
    presenceUpdate: [oldPresence: Presence, newPresence: Presence],
    /**
     * Fires when a private message is received
     */
    privateMessage: [message: Message],
    /**
     * Fires when a subscriber accepts a private message request
     */
    privateMessageAcceptResponse: [subscriber: Subscriber],
    /**
     * Fires when a private message is updated
     */
    privateMessageUpdate: [],
    /**
     * Fires when a private message is tipped
     */
    privateTipAdd: [tip: Tip],
    /**
     * Fires when the clients internal rate limit is triggered
     */
    rateLimit: [rateLimit: { queue: string, until: Date }],
    /**
     * Fires when the client is ready for uses
     */
    ready: [],
    /**
     * Fires when the client reconnects to the server and is ready for use
     */
    resume: [],
    /**
     * Fires when the client reconnects to the server
     */
    reconnected: [],
    /**
     * Fires when the client is attempting to reconnect to the server
     */
    reconnecting: [attempt: number],
    /**
     * Fires when the client fails to reconnect to the server
     */
    reconnectFailed: [error: Error],
    /**
     * Fires when a stage broadcast ends
     */
    stageClientEnd: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client connects
     */
    stageClientConnected: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is connecting
     */
    stageClientConnecting: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client disconnects
     */
    stageClientDisconnected: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage clients broadcast duration updates
     */
    stageClientDuration: [data: StageClientDurationUpdate],
    /**
     * Fires when a stage client encounters an error
     */
    stageClientError: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is kicked
     */
    stageClientKicked: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is muted
     */
    stageClientMuted: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is ready to broadcast
     */
    stageClientReady: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client starts broadcasting
     */
    stageClientStart: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is stopped
     */
    stageClientStopped: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client is unmuted
     */
    stageClientUnmuted: [data: StageClientGeneralUpdate],
    /**
     * Fires when a stage client viewer count changes
     */
    stageClientViewerCountChanged: [data: StageClientViewerCountUpdate],
    /**
     * Fires when the bots credit balance changes
     */
    storeCreditBalanceUpdate: [oldBalance: number, newBalance: number],
    /**
     * Fires when a user is added to the bots blocked list
     */
    subscriberBlockAdd: [contact: Contact],
    /**
     * Fires when a user is removed from the bots blocked list
     */
    subscriberBlockDelete: [contact: Contact],
    /**
     * Fires when a user is added as a contact
     */
    subscriberContactAdd: [contact: Contact],
    /**
     * Fires when a user is removed as a contact
     */
    subscriberContactDelete: [contact: Contact],
    /**
    * Fires when a  subscriber notification has been received
    */
    subscriberNotificationAdd: [notification: Notification],
    /**
     * Fires when the  subscriber notification list has been cleared
     */
    subscriberNotificationClear: [],
    /**
     * Fires when a  subscriber notification has been deleted
     */
    subscriberNotificationDelete: [notification: Notification],

    /**
     * Fires when the bot subscribes to an event
     * @deprecated use subscriberChannelEventAdd
     */
    subscriberGroupEventAdd: [event: Event],
    /**
     * Fires when the bot subscribes to an event
     */
    subscriberChannelEventAdd: [event: Event],
    /**
     * Fires when the bot unsubscribes from an event
     * @deprecated use subscriberChannelEventDelete
     */
    subscriberGroupEventDelete: [event: Event],
    /**
     * Fires when the bot unsubscribes from an event
     */
    subscriberChannelEventDelete: [event: Event],
    /**
     * Fires when a subscribers profile is updated
     */
    subscriberUpdate: [oldSubscriber: Subscriber, newSubscriber: Subscriber],
    /**
     * Fires when the client receives the welcome event
     */
    welcome: [welcome: Welcome],
}

//#endregion

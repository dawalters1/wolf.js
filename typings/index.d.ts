
import { StatusCodes } from 'http-status-codes';
import type { Stream } from 'stream';

export class Response<t = undefined> {
    public code: StatusCodes;
    public body: t;
    public headers: { [key: string]: any }

    public success: boolean;
}


export class WOLF {
    public constructor();

    public achievement: AchievementHelper;
    public authorization: AuthorizationHelper;
    public banned: BannedHelper;
    public charm: CharmHelper;
    public commandHandler: CommandHandler;
    public contact: ContactHelper;
    public discovery: DiscoveryHelper;
    public event: EventHelper;
    public group: GroupHelper;
    public messaging: MessagingHelper;
    public multimedia: Multimedia;
    public misc: MiscHelper;
    public notification: NotificationHelper;
    public phrase: PhraseHelper;
    public store: StoreHelper;
    public subscriber: SubscriberHelper;
    public tipping: TippingHelper;
    public topic: TopicHelper;
    public utility: Utility;
    public websocket: Websocket;

    public login(): void;
    public logout(): Promise<void>;

    //public on<evtStr extends keyof ClientEvents>(event: evtStr, listener: (...args: ClientEvents[evtStr]) => void): this;

}

export class Websocket {
    private constructor(client: WOLF);

    public emit<T>(command: string, body?: Object): Response<T>;
}

export class Multimedia {
    private constructor(client: WOLF);

    public upload<T>(config: any, body: object): Promise<Response<T>>
}

export class CommandHandler {
    private constructor(client: WOLF);

    public register(command: Array<Command>): void;
    public isCommand(message: Message): boolean;
}

export class Command {
    constructor(phraseName: string, callbackObject: { group: (command: Command, ...args: any) => void, private: (command: Command, ...args: any) => void, both: (command: Command, ...args: any) => void }, children: Array<Command>)
}
export class Base {
    public constructor(client: WOLF);

    private _cleanUp(reconnection: boolean)
}

//#region Helpers
export class AchievementHelper extends Base {
    private constructor(client)

    public achievements: { [key: number]: Array<Achievement> }
    public category: AchievementCategoryHelper;
    public group: AchievementGroupHelper;
    public subscriber: AchievementSubscriberHelper;

    public getById(id: number, language: Language, forceNew: boolean): Promise<Achievement>;
    public getByIds(ids: number | Array<number>, language: Language, forceNew: boolean): Promise<Array<Achievement>>;
}

export class AchievementCategoryHelper extends Base {
    private constructor(client);

    public categories: { [key: number]: Array<AchievementCategory> };
    public getList(language: Language, forceNew: boolean): Promise<Array<Achievement>>;
}

export class AchievementGroupHelper extends Base {
    private constructor(client);

    public getById(targetGroupId: number, parentId?: number): Promise<Array<AchievementUnlockable>>;
}

export class AchievementSubscriberHelper extends Base {
    private constructor(client);

    public getById(subscriberId: number, parentId?: number): Promise<Array<AchievementUnlockable>>;
}

export class AuthorizationHelper extends Base {
    private constructor(client);

    public authorized: Array<number>;
    public list(): Array<number>;
    public clear(): void;
    public isAuthorized(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public authorize(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public unauthorize(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
}

export class BannedHelper extends Base {
    private constructor(client);

    public banned: Array<number>;
    public list(): Array<number>;
    public clear(): void;
    public isBanned(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public ban(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public unban(targetSubscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
}

export class CharmHelper extends Base {
    private constructor(client);

    public charms: Array<Charm>;
    public list(): Array<Charm>;
    public getById(id: number): Promise<Charm>;
    public getByIds(ids: number | Array<number>): Promise<Charm | Array<Charm>>;
    public getSubscriberSummary(subscriberId: number): Promise<CharmSummary>
    public getSubscriberStatistics(subscriberId: number): Promise<CharmStatistics>
    public getSubscriberActiveList(subscriberId: number, limit?: number, offset?: number): Promise<Array<CharmExpiry>>
    public getSubscriberExpiredList(subscriberId: number, limit?: number, offset?: number): Promise<Array<CharmExpiry>>
    public delete(charmIds: number | Array<number>): Promise<Response>
    public set(charms: CharmSelected): Promise<Response>;
}

export class ContactHelper extends Base {
    private constructor(client);

    public contacts: Array<Contact>;
    public blocked: BlockedHelper;

    public list(): Promise<Array<Contact>>;
    public isContact(subscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public add(subscriberId: number): Promise<Response>;
    public delete(subscriberId: number): Promise<Response>;
}

export class BlockedHelper extends Base {
    private constructor(client);

    public blocked: Array<Contact>;

    public list(): Promise<Array<Contact>>;
    public isBlocked(subscriberIds: number | Array<number>): Promise<boolean | Array<boolean>>
    public block(subscriberId: number): Promise<Response>;
    public unblock(subscriberId: number): Promise<Response>;
}

export class DiscoveryHelper extends Base {
    private constructor(client);

    public discovery: {
        [key: string]: {
            main: Discovery,
            pages: { [key: string]: object }
        }
    }

    public get(languageId: Language, forceNew: boolean): Promise<Discovery>;
}

export class EventHelper extends Base {
    private constructor(client);

    public getById(id: number): Promise<Event>;
    public getByIds(ids: number | Array<number>): Promise<Event | Array<Event>>;
}

export class GroupEventHelper extends Base {
    private constructor(client);

    public getList(targetGroupId: number, subscribe: boolean, forceNew: false): Promise<Array<Event>>;
    //Incorrect response
    public create(targetGroupId: number, title: string, startsAt: Date, endsAt: Date, shortDescription: string, longDescription: string, thumbnail: Buffer): Promise<Response<Response>>
    //Incorrect response
    public update(targetGroupId: number, eventId: number, title: string, startsAt: Date, endsAt: Date, shortDescription: string, longDescription: string, imageUrl: string, thumbnail: Buffer): Promise<Response<Response>>
    public updateThumbnail(eventId: number, thumbnail: Buffer): Promise<Response>
    public delete(targetGroupId: number, eventId: number): Promise<Response>
}

export class EventSubscriptionHelper extends Base {
    private constructor(client);

    public getList(subscribe: boolean): Promise<Array<Event>>;
    public add(eventId: number): Promise<Response>;
    public remove(eventId: number): Promise<Response>;
}

export class GroupHelper extends Base {
    private constructor(client);

    public fetched: boolean;
    public groups: Array<Group>;
    public member: GroupMemberHelper;

    public list(): Promise<Array<Group>>;
    public getById(id: number, subscribe: boolean, forceNew: boolean): Promise<Group>;
    public getByIds(ids: number | Array<number>, subscribe: boolean, forceNew: boolean): Promise<Group | Array<Group>>;
    public getByName(name: string, subscribe: boolean, forceNew: boolean): Promise<Group>;
    public joinById(id: number, password?: string): Promise<Response>;
    public joinByName(name: string, password?: string): Promise<Response>;
    public leaveById(id: number): Promise<Response>;
    public leaveByName(name: string): Promise<Response>;
    public getChatHistory(id: number, chronological: boolean, timestamp?: number, limit?: number): Promise<Array<Message>>;
    public getStats(id: number): Promise<GroupStats>;
    public getRecommendationList(): Promise<Array<Group>>;
    public search(query: string): Promise<Array<Search>>;
}

export class GroupMemberHelper extends Base {
    private constructor(client);

    public getBotList(targetGroupId: number, returnCurrentList: boolean): Promise<Array<GroupMember>>;
    public getSilencedList(targetGroupId: number, returnCurrentList: boolean): Promise<Array<GroupMember>>;
    public getBannedList(targetGroupId: number, limit: number): Promise<Array<GroupMember>>;
    public getPrivilegedList(targetGroupId: number): Promise<Array<GroupMember>>;
    public getRegularList(targetGroupId: number, returnCurrentList: boolean): Promise<Array<GroupMember>>;
    public get(targetGroupId: number, subscriberId: number): Promise<GroupMember>;
    public admin(targetGroupId: number, subscriberId: number): Promise<Response>;
    public mod(targetGroupId: number, subscriberId: number): Promise<Response>;
    public regular(targetGroupId: number, subscriberId: number): Promise<Response>;
    public silence(targetGroupId: number, subscriberId: number): Promise<Response>;
    public ban(targetGroupId: number, subscriberId: number): Promise<Response>;
    public kick(targetGroupId: number, subscriberId: number): Promise<Response>;
}

export class MessagingHelper extends Base {
    private constructor(client);

    public subscription: MessagingSubscriptionHelper;

    public sendGroupMessage(targetGroupId: number, content: string | Buffer, options: MessageSendOptions): Promise<MessageResponse>;
    public sendPrivateMessage(targetSubscriberId: number, content: string | Buffer, options: MessageSendOptions): Promise<MessageResponse>;
    public sendMessage(commandOrMessage: Command | Message, content: string | Buffer, options: MessageSendOptions): Promise<MessageResponse>;
    public getGroupMessageEditHistory(targetGroupId: number, timestamp: number): Promise<Array<Message>>;
    public deleteGroupMessage(targetGroupId: number, timestamp: number): Promise<Response>;
    public restoreGroupMessage(targetGroupId: number, timestamp: number): Promise<Response>;
}

export class MessagingSubscriptionHelper extends Base {
    private constructor(client);

    public subscriptions: {
        [key: string]: {
            id: string,
            predicate: Function,
            def: Promise<Message>,
            timeout: Number
        }
    }
    public nextMessage(predicate: Function, timeout: Number): Promise<Message>
    public nextGroupMessage(targetGroupId: number, timeout: Number): Promise<Message>
    public nextPrivateMessage(sourceSubscriberId: number, timeout: Number): Promise<Message>
    public nextGroupSubscriberMessage(targetGroupId: number, sourceSubscriberId: number, timeout: Number): Promise<Message>
}

export class MiscHelper extends Base {
    private constructor(client);

    public blacklist: Array<BlacklistLink>;
    public metadataResults: Array<LinkMetadata>;

    public metadata(url: string): Promise<LinkMetadata>;
    public linkBlacklist(forceNew: boolean): Promise<Array<BlacklistLink>>;
    public getSecurityToken(forceNew: boolean): Promise<any>;
    public getMessageSettings(): Promise<Response<MessageSettings>>;
    public updateMessageSettings(messageFilterTier: MessageFilterTier): Promise<Response>;
}

export class NotificationHelper extends Base {
    private constructor(client);

    public notifications: Array<Notification>
    public list(forceNew: boolean): Promise<Array<Notification>>;
    public clear(): Promise<Response>;
}

export class PhraseHelper extends Base {
    private constructor(client);

    public load(phrases: Array<Phrase>): void;
    public count(): PhraseCount;
    public getAllByName(name: string): Array<Phrase>;
    public getByLanguageAndName(language: string, name: string): string;
    public getByCommandAndName(command: Command, name: string): string;
    public isRequestedPhrase(name: string, input: string): boolean;
}

export class StageHelper extends Base {
    private constructor(client);

    public request: StageRequestHelper;
    public slot: StageSlotHelper;

    public play(targetGroupId: number, data: Stream): void;
    public stop(targetGroupId: number): void;
    public pause(targetGroupId: number): void;
    public resume(targetGroupId: number): void;
    public getBroadcastState(targetGroupId: number): StageBroadcastState;
    public isPlaying(targetGroupId: number): boolean;
    public isPaused(targetGroupId: number): boolean;
    public isIdle(targetGroupId: number): boolean;
    public duration(targetGroupId: number): number;
    public getVolume(targetGroupId: number): number;
    public setVolume(targetGroupId: number): void;
}

export class StageRequestHelper extends Base {
    private constructor(client);

    public list(targetGroupId: number, subscribe: boolean, forceNew: boolean): Promise<GroupAudioSlotRequest>;
    public add(targetGroupId: number, slotId: number, subscriberId: number): Promise<Response>
    public delete(targetGroupId: number, slotId: number): Promise<Response>
    public clear(targetGroupId: number): Promise<Response>
}

export class StageSlotHelper extends Base {
    private constructor(client);

    public list(targetGroupId: number, subscribe: boolean): Promise<Array<GroupAudioSlot>>
    public get(targetGroupId: number, slotId: number): Promise<GroupAudioSlot>;
    public lock(targetGroupId: number, slotId: number): Promise<Response>;
    public unlock(targetGroupId: number, slotId: number): Promise<Response>;
    public mute(targetGroupId: number, slotId: number): Promise<Response>;
    public unmute(targetGroupId: number, slotId: number): Promise<Response>;
    public kick(targetGroupId: number, slotId: number): Promise<Response>;
    public join(targetGroupId: number, slotId: number): Promise<Response<Object>>;
}

export class StoreHelper extends Base {
    private constructor(client);

    public getCreditList(languageId: Language, forceNew: boolean): Promise<Array<StoreProductCredits>>;
    public get(languageId: Language, includeCredits: boolean, forceNew: boolean): Promise<Store>;
    public getProducts(ids: number | Array<number>, languageId: Language, forceNew: boolean): Promise<StoreProductPartial | Array<StoreProductPartial>>;
    public getFullProduct(id: number, languageId: Language, forceNew: boolean): Promise<StoreProduct>;
    public purachse(productDurationId: number, quanitity: number, ids: number | Array<number>): Promise<Response>;
    public getCreditBalance(forceNew: boolean): Promise<number>
}

export class SubscriberHelper extends Base {
    private constructor(client);

    public subscribers: Array<Subscriber>;
    public presence: SubscriberPresenceHelper;
    public wolfstars: WolfStarsHelper;

    public getById(id: number, subscribe: boolean, forceNew: boolean): Promise<Subscriber>;
    public getByIds(ids: number | Array<number>, subscribe: boolean, forceNew: boolean): Promise<Subscriber | Array<Subscriber>>;
    public getChatHistory(id: number, timestamp?: number, limit?: number): Promise<Array<Message>>;
    public search(query: string): Promise<Array<Search>>;
}


export class WolfStarsHelper extends Base {
    private constructor(client);

    public getProfile(subscriberId: number): Promise<WolfstarsProfile>;
}

export class SubscriberPresenceHelper extends Base {
    private constructor(client);

    public presences: Array<Presence>;

    public getById(id: number, subscribe: boolean, forceNew: boolean): Promise<Presence>;
    public getByIds(ids: number | Array<number>, subscribe: boolean, forceNew: boolean): Promise<Presence | Array<Presence>>;
}

export class TippingHelper extends Base {
    private constructor(client);

    public tip(targetSubscriberId: number, targetGroupId: number, context: TipContext, charms: TipCharm | Array<TipCharm>): Promise<Response>;
    public getDetails(targetGroupId: number, timestamp: number, limit: number, offset: number): Promise<Response<TipDetail>>;
    public getSummary(targetGroupId: number, timestamp: number, limit: number, offset: number): Promise<Response<TipSummary>>;
    public getGroupLeaderboard(targetGroupId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboard>>;
    public getGroupLeaderboardSummary(targetGroupId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboardSummary>>;
    public getGlobalLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<Response<TipLeaderboard>>;
    public getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<Response<TipLeaderboardSummary>>;
}

export class TopicHelper extends Base {
    private constructor(client);

    public getTopicPageLayout(name: string, languageId: Language): Promise<Response<object>>;
    public getTopicPageRecipeList(id: number, languageId: Language, maxResults: number, offset: number, type: TopicPageRecipeType): Promise<Response<Array<object>>>;
}
//#endregion

//#region Utilities
export class ArrayUtility {
    chunk(array: Array<any>, length: number): Array<Array<any>>;
    shuffle(array: Array<any>): Array<any>;
    getRandom(array: Array<any>, amount: number): any;
    join(arrays: Array<Array<any>>): Array<any>;
    reverse(array: Array<any>): Array<any>;
    take(array: Array<any>, length: number): Array<any>;
    includes(array: Array<any>, object: any): any;
}

export class GroupUtility extends Base {
    private constructor(client: WOLF);

    public member: GroupMemberUtility;

    public avatar(groupId: number, size: IconSize): Buffer;
}

export class GroupMemberUtility extends Base {
    private constructor(client: WOLF);

    public hasCapability(targetGroupId: number, targetSubscriberId: number, capability: Capability, checkStaff: boolean, checkAuthorized: boolean): Promise<boolean>
}

export class NumberUtility {
    public toEnglishNumber(arg: number | string): number | string;
    public toArabicNumbers(arg: number | string): number | string;
    public toPersianNumbers(arg: number | string): number | string;
    public addCommas(arg: number | string): number | string;
    public random(min: number, max: number): number;
    public clamp(number: number, lower: number, upper: number): number;
}

export class StringUtility {
    private constructor(client: WOLF);

    public replace(string: string, replacements: { [key: string]: string | number }): string;
    public isEqual(sideA: string, sideB: string): boolean;
    public chunk(string: string, length: string, splitChar: string, joinChar: string): Array<string>;
    public trimAds(string: string): string;
    public getLinks(string: string): Array<Link>;
    public getAds(string: string): Array<Ad>;
    public sanitise(string: string): string;
}

export class SubscriberUtility extends Base {
    private constructor(client: WOLF);

    public privilege: SubscriberPrivilegeUtility;

    public avatar(subscriberId: number, size: IconSize): Buffer;
}

export class SubscriberPrivilegeUtility extends Base {
    private constructor(client: WOLF);

    public has(subscriberId: number, privileges: Privilege | Array<Privilege>, requireAll: boolean): Promise<boolean>
}

export class TimerUtility {
    public initialise(handlers: { [key: string]: any }, ...args: any): Promise<void>;
    public add(name: string, handler: string, data: object, duration: number): Promise<TimerJob>;
    public cancel(name: string): Promise<TimerJob>;
    public get(name: string): Promise<TimerJob>;
    public delay(name: string, duration: Number): Promise<TimerJob>;
}

export class Utility {
    private constructor(client: WOLF);

    public array: ArrayUtility;
    public group: GroupUtility;
    public number: NumberUtility;
    public string: StringUtility;
    public subscriber: SubscriberUtility;
    public timer: TimerUtility;

    public download(url: string): Promise<Buffer>;
    public toLanguageId(languageKey: string): Language;
    public toLanguageKey(languageId: Language): string;
    public delay(time: number, type: 'milliseconds' | 'seconds'): Promise<void>
    public toReadableTime(language: string, time: number, type: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): string;

}
//#endregion

//#region Models

export class BaseModel {
    public constructor(client: WOLF);

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

    toJSON(): Object;
}

export class AchievementCategory extends Base {
    private constructor(client: WOLF, data: object);

    public id: number;
    public name: string;

    toJSON(): Object;
}

export class AchievementUnlockable extends Base {
    private constructor(client: WOLF, data: object);

    public id: number;
    public additionalInfo: AchievementUnlockableAdditionalInfo;

    toJSON(): Object;
}

export class AchievementUnlockableAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object)

    public awardedAt: Date;
    public eTag: string;

    toJSON(): Object;
}

export class Ad extends Base {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public ad: string;

    toJSON(): Object;
}

export class BlacklistLink extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public regex: string;

    toJSON(): {
        id: number,
        regex: string
    }
}

export class Charm extends Base {
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

    toJSON(): Object;
}

export class CharmExpiry extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public charmId: number;
    public subscriberId: number;
    public sourceSubscriberId: number;
    public expireTime: Date;

    toJSON(): Object;
}

export class CharmSelected extends Base {
    private constructor(client: WOLF, data: object)

    public charmId: number;
    public position: number;

    toJSON(): Object;
}

export class CharmStatistics extends Base {
    private constructor(client: WOLF, data: object)

    public subscriberId: number;
    public totalGiftedSent: number;
    public totalGiftedReceived: number;
    public totalLifetime: number;
    public totalActive: number;
    public totalExpired: number;

    toJSON(): Object;
}

export class CharmSummary extends Base {
    private constructor(client: WOLF, data: object)

    public charmId: number;
    public total: number;
    public expireTime: Date;
    public giftCount: number;

    toJSON(): Object;
}

export class CommandContext extends Base {
    private constructor(client: WOLF, data: object)
    public isGroup: boolean;
    public argument: string;
    public targetGroupId: number | undefined;
    public sourceSubscriberId: number | undefined;
    public timestamp: number;
    public type: MessageType;

    public subscriber(): Promise<Subscriber>;
    public group(): Promise<Group>;
    public reply(content: string | Buffer, options: MessageSendOptions): Promise<Response<MessageResponse>>;
    public replyPrivate(content: string | Buffer, options: MessageSendOptions): Promise<Response<MessageResponse>>;

    toJSON(): Object;
}

export class Contact extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public additionalInfo: ContactAdditionalInfo;

    toJSON(): Object;
}

export class ContactAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object)

    public hash: number;
    public nicknameShort: string;
    public onlineState: OnlineState;
    public privileges: Privilege;

    toJSON(): Object;
}

export class Discovery extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<DiscoverySection>;

    public get(value: number | string, offset: number): Promise<DiscoverySection | DiscoveryPage | Array<Group> | Array<StoreProductPartial> | Array<Event>>;

    toJSON(): Object;
}

export class DiscoveryPage extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<DiscoverySection>;

    public get(value: number | string, offset: number): Promise<DiscoverySection | DiscoveryPage | Array<Group> | Array<StoreProductPartial> | Array<Event>>;

    toJSON(): Object;
}

export class DiscoverySection extends Base {
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

    public get(offset: number): Promise<DiscoveryPage | Array<Group> | Array<StoreProductPartial> | Array<Event>>;

    toJSON(): Object;
}

export class Event extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
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
    public createdAt: Date;
    public updatedAt: Date;

    toJSON(): Object;
}

export class Group extends Base {
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
    public extended: GroupExtended;
    public audioCounts: GroupAudioCounts;
    public audioConfig: GroupAudioConfig;
    public messageConfig: GroupMessageConfig;
    public members: GroupMemberList;

    public inGroup: boolean;
    public capabilities: Capability;
    public exists: boolean;

    public getAvatarUrl(size: IconSize): string;
    public getAvatar(size: IconSize): Promise<Buffer>;

    toJSON(): Object;
}

export class GroupAudioConfig extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public enabled: boolean;
    public stageId: number | undefined;
    public minRepLevel: number;

    toJSON(): Object;
}

export class GroupAudioCounts extends Base {
    private constructor(client: WOLF, data: object)

    public broadcasterCount: number;
    public consumerCount: number;
    public id: number;

    toJSON(): Object;
}

export class GroupAudioSlot extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public groupId: number;
    public locked: boolean;
    public occupierId: number;
    public uuid: string;
    public connectionState: StageConnectionState;
    public reservedOccupierId: number | undefined;
    public reservedExpiresAt: Date | undefined;

    toJSON(): Object;
}

export class GroupAudioSlotRequest extends Base {
    private constructor(client: WOLF, data: object)

    public slotId: number;
    public groupId: number;
    public reservedOccupierId: number;
    public reservedExpiresAt: Date;

    toJSON(): Object;
}

export class GroupAudioSlotUpdate extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public slot: GroupAudioSlot;

    toJSON(): Object;
}

export class GroupExtended extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public longDescription: string;
    public discoverable: boolean;
    public language: Language;
    public category: AchievementCategory;
    public advancedAdmin: boolean;
    public questionable: boolean;
    public locked: boolean;
    public closed: boolean;
    public passworded: boolean;
    public entryLevel: number;

    toJSON(): Object;
}

export class GroupMember extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public hash: string;
    public capabilities: Capability;

    toJSON(): Object;
}

export class GroupMemberList extends Base {
    private constructor(client: WOLF, data: object)

    toJSON(): Object;
}

export class GroupMessageConfig extends Base {
    private constructor(client: WOLF, data: object)

    public disableHyperlink: boolean;
    public disableImage: boolean;
    public disableImageFilter: boolean;
    public disableVoice: boolean;
    public id: number;
    public slowModeRateInSeconds: number;

    toJSON(): Object;
}

export class GroupStats extends Base {
    private constructor(client: WOLF, data: object)

    public details: GroupStatsDetail;
    public next30: Array<GroupStatsActive>;
    public top25: Array<GroupStatsTop>;
    public topAction: Array<GroupStatsTop>;
    public topEmoticon: Array<GroupStatsTop>;
    public topHappy: Array<GroupStatsTop>;
    public topImage: Array<GroupStatsTop>;
    public topQuestion: Array<GroupStatsTop>;
    public topSad: Array<GroupStatsTop>;
    public topSwear: Array<GroupStatsTop>;
    public topText: Array<GroupStatsTop>;
    public topWord: Array<GroupStatsTop>;
    public trends: Array<GroupStatsTrend>;
    public trendsDay: Array<GroupStatsTrend>;
    public trendsHours: Array<GroupStatsTrend>;

    toJSON(): Object;
}

export class GroupStatsActive extends Base {
    private constructor(client: WOLF, data: object)

    public actionCount: number;
    public emoticonCount: number;
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

    toJSON(): Object;
}

export class GroupStatsDetail extends Base {
    private constructor(client: WOLF, data: object)

    public actionCount: number;
    public emoticonCount: number;
    public id: number;
    public happyCount: number;
    public imageCOunt: number;
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

    toJSON(): Object;
}

export class GroupStatsTop extends Base {
    private constructor(client: WOLF, data: object)

    public nickname: string;
    public randomQoute: string;
    public subId: number;
    public value: number;
    public percentage: number;

    toJSON(): Object;
}

export class GroupStatsTrend extends Base {
    private constructor(client: WOLF, data: object)

    public day: number;
    public hour: number;
    public lineCount: number;

    toJSON(): Object;
}

export class IconInfo extends Base {
    private constructor(client: WOLF, data: object)

    public availableSizes: IconInfoAvailableSize;

    toJSON(): Object;
}

export class IconInfoAvailableSize extends Base {
    private constructor(client: WOLF, data: object)

    public small: string;
    public medium: string;
    public large: string;
    public xlarge: string;

    get(size: IconSize): string;

    toJSON(): Object;
}

export class IdHash extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public hash: string;
    public nickname: string;

    toJSON(): Object;
}

export class Link extends Base {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public link: string;

    toJSON(): Object;
}

export class LinkMetadata extends Base {
    private constructor(client: WOLF, data: object)

    public description: string;
    public domain: string;
    public imageSize: number;
    public imageUrl: string;
    public isOfficial: boolean;
    public title: string;

    toJSON(): Object;
}

export class Message extends Base {
    private constructor(client: WOLF, data: object)

    public id: string;
    public body: string;
    public sourceSubscriberId: number;
    public targetGroupId: number;
    public embeds: Array<MessageEmbed>;
    public metadata: MessageMetadata;
    public isGroup: boolean;
    public timestamp: number;
    public edited: MessageEdit;
    public type: MessageType;
    public isCommand: boolean;

    public reply(content: string | Buffer, options: MessageSendOptions): Promise<Response<MessageResponse>>;
    public delete(): Promise<Response>;
    public restore(): Promise<Response>;

    public tip(charm: TipCharm | Array<TipCharm>): Promise<Response>;

    toJSON(): Object;
}

export class MessageEdit extends Base {
    private constructor(client: WOLF, data: object)

    public subscriberId: number;
    public timestamp: number;

    toJSON(): Object;
}

export class MessageEmbed extends Base {
    private constructor(client: WOLF, data: object)

    public type: EmbedType;
    public groupId: number;
    public url: string;
    public title: string;
    public image: Buffer;
    public body: string;

    toJSON(): Object;
}

export class MessageMetadata extends Base {
    private constructor(client: WOLF, data: object)

    public formatting: MessageMetadataFormatting;
    public isDeleted: boolean;
    public isEdited: boolean;
    public isSpam: boolean;
    public isTipped: boolean;

    toJSON(): Object;
}

export class MessageMetadataFormatting extends Base {
    private constructor(client: WOLF, data: object)

    public groupLinks: Array<MessageMetadataFormattingGroupLink>;
    public links: Array<MessageMetadataFormattingUrl>

    toJSON(): Object;
}

export class MessageMetadataFormattingGroupLink extends Base {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public groupId: number;

    toJSON(): Object;
}

export class MessageMetadataFormattingUrl extends Base {
    private constructor(client: WOLF, data: object)

    public start: number;
    public end: number;
    public url: string;

    toJSON(): Object;
}

export class MessageResponse extends Base {
    private constructor(client: WOLF, data: object)

    public uuid: string;
    public timestamp: number;
    public slowModeRateInSeconds: number;

    toJSON(): Object;
}

export class MessageSettings extends Base {
    private constructor(client: WOLF, data: object)

    public spamFilter: MessageSettingFilter;

    toJSON(): Object;
}

export class MessageSendOptions {
    public formatting: {
        includeEmbeds: boolean,
        me: boolean,
        alert: boolean
    }
}

export class MessageSettingFilter extends Base {
    private constructor(client: WOLF, data: object)

    public enabled: boolean;
    public tier: MessageFilterTier;

    toJSON(): Object;
}

export class Notification extends Base {
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

    toJSON(): Object;
}

export class NotificationAction extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public titleText: string;
    public actionurl: string;
    public external: boolean;
    public imageUrl: string;

    toJSON(): Object;
}

export class Phrase extends Base {
    private constructor(client: WOLF, data: object)

    public name: string;
    public value: string;
    public language: string;

    toJSON(): Object;
}

export class PhraseCount extends Base {
    private constructor(client: WOLF, data: object)

    public phrases: number;
    public phrasesPerLanguage: { [key: string]: number }

    toJSON(): Object;
}

export class Presence extends Base {
    private constructor(client: WOLF, data: object)

    public device: DeviceType;
    public state: OnlineState;
    public lastActive: Date;
    public subscriberId: number;

    toJSON(): Object;
}

export class Search extends Base {
    private constructor(client: WOLF, data: object)

    public searchType: SearchType;
    public id: number;
    public hash: string;
    public reason: string;

    toJSON(): Object;
}

export class Store extends Base {
    private constructor(client: WOLF, data: object, languageId: Language)

    public id: number;
    public title: string;
    public languageId: Language;
    public credits: Array<StoreProductCredits>;
    public sections: Array<StoreSection>;

    public get(value: number | string, offset: number): Promise<StoreSection | StorePage | Array<StoreProductPartial>>;
    public getCreditList(): Promise<Array<StoreProductCredits>>;

    toJSON(): Object;
}

export class StorePage extends Base {
    private constructor(client: WOLF, data: object, languageId: Language)

    public id: number;
    public title: string;
    public languageId: Language;
    public sections: Array<StoreSection>;

    public get(value: number | string, offset: number): Promise<StoreSection | StorePage | Array<StoreProductPartial>>;

    toJSON(): Object;
}

export class StoreProduct extends Base {
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

    public purchase(duration: StoreProductDuration | number, quanitity: number, targetGroupIds: number | Array<number>): Promise<Response>;
    public purchase(quanitity: number, targetGroupIds: number | Array<number>): Promise<Response>;

    toJSON(): Object;
}

export class StoreProductCredits extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public credits: number;
    public code: string;
    public imageUrl: string;
    public name: string;
    public description: string;

    toJSON(): Object;
}

export class StoreProductDuration extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public days: number;
    public credits: number;

    public purchase(quanitity: number, targetGroupIds: number | Array<number>): Promise<Response>;

    toJSON(): Object;
}

export class StoreProductImage extends Base {
    private constructor(client: WOLF, data: object)

    public url: string;

    toJSON(): Object;
}

export class StoreProductPartial extends Base {
    private constructor(client: WOLF, data: object, languageId: Language)

    public credits: number;
    public id: number;
    public languageId: Language;
    public imageUrl: string;
    public isLimited: boolean;
    public name: string;
    public promotionText: string;
    public reputatationLevel: number;
    public targetType: string;
    public charmId: number;
    public botId: number;

    public getFullProduct(languageId?: Language): Promise<StoreProduct>;

    toJSON(): Object;
}

export class StoreSection extends Base {
    private constructor(client: WOLF, data: object, languageId: Language, fromSubPage: boolean)

    public id: number;
    public languageId: Language;
    public validity: Validity;

    public title: string;
    public images: Array<string>
    public description: string;
    public videos: Array<TopicSectionVideo>;
    public addtionalDescriptions: Array<string>

    public get(offset: number): Promise<StorePage | Array<StoreProductPartial>>;

    toJSON(): Object;
}

export class Subscriber extends Base {
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
    public status: string;
    public language: string;

    public exists: boolean;

    public getAvatarUrl(size: IconSize): string;
    public getAvatar(size: IconSize): Promise<Buffer>;

    toJSON(): Object;
}

export class SubscriberEvent extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public groupId: number;
    public additionalInfo: SubscriberEventAdditionalInfo;

    toJSON(): Object;
}

export class SubscriberEventAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object)

    public eTag: string;
    public endsAt: Date;
    public startsAt: Date;

    toJSON(): Object;
}

export class SubscriberExtended extends Base {
    private constructor(client: WOLF, data: object)
    public about: string;
    public gender: Gender;
    public language: Language;
    public lookinFor: LookingFor;
    public lookingForExtended: Array<LookingFor>;
    public name: string;
    public relationship: Relationship;
    public urls: Array<string>;
    public utcOffset: number;

    toJSON(): Object;
}

export class SubscriberSelectedCharm extends Base {
    private constructor(client: WOLF, data: object)

    public selectedList: Array<CharmSelected>;

    toJSON(): Object;
}

export class TimerJob extends Base {
    private constructor(client: WOLF, data: object)

    public handler: string;
    public data: Object;
    public duration: number;
    public timestamp: number;
    public id: string;
    public remaining: number;

    cancel(): Promise<void>;
    delay(duration: number): Promise<void>

    toJSON(): Object;
}

export class Tip extends Base {
    private constructor(client: WOLF, data: object)

    public charmList: Array<TipCharm>;
    public groupId: number;
    public isGroup: boolean;
    public sourceSubscriberId: number;
    public subscriberId: number;
    public context: TipContext;

    toJSON(): Object;
}

export class TipCharm extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public quanitity: number;
    public credits: number;
    public magnitude: number;
    public subscriber: IdHash;

    toJSON(): Object;
}

export class TipContext extends Base {
    private constructor(client: WOLF, data: object)

    public type: ContextType;
    public id: number;

    toJSON(): Object;
}

export class TipDetail extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public list: Array<TipCharm>;
    public version: number;

    toJSON(): Object;
}

export class TipLeaderboard extends Base {
    private constructor(client: WOLF, data: object)

    public leaderboard: Array<TipLeaderboardItem>;

    toJSON(): Object;
}

export class TipLeaderboardItem extends Base {
    private constructor(client: WOLF, data: object)

    public rank: number;
    public charmId: number;
    public quanitity: number;
    public credits: number;
    public group: IdHash;
    public subscriber: IdHash;

    toJSON(): Object;
}

export class TipLeaderboardSummary extends Base {
    private constructor(client: WOLF, data: object)

    public topGifters: Array<IdHash>;
    public topGroups: Array<IdHash>;
    public topSpenders: Array<IdHash>;

    toJSON(): Object;
}

export class TipSummary extends Base {
    private constructor(client: WOLF, data: object)

    public id: number;
    public charmList: Array<TipCharm>;
    public version: number;

    toJSON(): Object;
}

export class TopicSectionVideo extends Base {
    private constructor(client: WOLF, data: object)

    public aspect: TopicSectionVideoAspect;
    public autoplay: boolean;
    public loop: boolean;
    public muted: boolean;
    public url: string;

    toJSON(): Object;
}

export class TopicSectionVideoAspect extends Base {
    private constructor(client: WOLF, data: object)

    public width: number;
    public height: number;

    toJSON(): Object;
}

export class Translation extends Base {
    private constructor(client: WOLF, data: object)

    public languageId: Language;
    public text: string;

    toJSON(): Object;
}

export class Validity extends Base {
    private constructor(client: WOLF, data: object)

    public fromTime: Date;
    public endTime: Date;

    toJSON(): Object;
}

export class ValidUrl extends Base {
    private constructor(client: WOLF, data: object)

    public url: string;
    public hostname: string;

    toJSON(): Object;
}

export class Welcome extends Base {
    private constructor(client: WOLF, data: object)

    public ip: string;
    public token: string;
    public country: string;
    public endpointConfig: WelcomeEndpoint;
    public subscriber: Subscriber;

    toJSON(): Object;
}

export class WelcomeEndpoint extends Base {
    private constructor(client: WOLF, data: object)

    public avatarEndpoint: string;
    public mmsUploadEndpoint: string;

    toJSON(): Object;
}

export class WOLFAPIError extends Error {
    private constructor(error: Error, param)

    public params: any
}

export class WolfstarsProfile extends Base {
    private constructor(client: WOLF, data: object)

    public maxListeners: number;
    public shows: number;
    public subscriberId: number;
    public talentList: Array<WolfstarTalent>;
    public totalListeners: number;
    public exists: boolean;

    toJSON(): Object;
}

//#endregion

//#region Constants

export const Constants: {
    AdminAction: AdminAction;
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
    WolfstarTalent: WolfstarTalent;
}

export interface AdminAction {
    REGULAR: 0,
    ADMIN: 1,
    MOD: 2,
    BAN: 4,
    SILENCE: 8,
    KICK: 16,
    JOIN: 17,
    LEAVE: 18,
    OWNER: 32,
}

export interface Capability {
    NOT_MEMBER: -1,
    REGULAR: 0,
    ADMIN: 1,
    MOD: 2,
    BANNED: 4,
    SILENCED: 8,
    OWNER: 32,
}

export interface Category {
    NOT_SPECIFIED: 0,
    BUSINESS: 8,
    EDUCATION: 10,
    ENTERTAINMENT: 26,
    GAMING: 12,
    LIFESTYLE: 13,
    MUSIC: 14,
    NEWS_AND_POLITICS: 15,
    PHOTOGRAPHY: 16,
    SCIENCE_AND_TECH: 25,
    SOCIAL_AND_PEOPLE: 17,
    SPORTS: 19,
    TRAVEL_AND_LOCAL: 18,
}

export interface ContextType {
    MESSAGE: "message",
    STAGE: "stage",
}

export interface DeviceType {
    OTHER: 0,
    BOT: 1,
    IPHONE: 5,
    IPAD: 6,
    ANDROID: 7,
    WEB: 8,
}

export interface EmbedType {
    IMAGE_PREVIEW: "imagePreview",
    GROUP_PREVIEW: "groupPreview",
    LINK_PREVIEW: "linkPreview",
}

export interface Gender {
    NOT_SPECIFIED: 0,
    MALE: 1,
    FEMALE: 2,
}

export interface IconSize {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    XLARGE: "xlarge"
}

export interface Language {
    NOT_SPECIFIED: 0,
    ENGLISH: 1,
    GERMAN: 3,
    SPANISH: 4,
    FRENCH: 6,
    POLISH: 10,
    CHINESE_SIMPLIFIED: 11,
    RUSSIAN: 12,
    ITALIAN: 13,
    ARABIC: 14,
    PERSIAN_FARSI: 15,
    GREEK: 16,
    PORTUGUESE: 17,
    HINDI: 18,
    JAPANESE: 19,
    LATIN_SPANISH: 20,
    SLOVAK: 21,
    CZECH: 22,
    DANISH: 24,
    FINNISH: 25,
    HUNGARIAN: 27,
    BAHASA_INDONESIA: 28,
    MALAY: 29,
    DUTCH: 30,
    NORWEGIAN: 31,
    SWEDISH: 32,
    THAI: 33,
    TURKISH: 34,
    VIETNAMESE: 35,
    KOREAN: 36,
    BRAZILIAN_PORTUGUESE: 37,
    ESTONIAN: 39,
    KAZAKH: 41,
    LATVIAN: 42,
    LITHUANIAN: 43,
    UKRAINIAN: 44,
    BULGARIAN: 45,
}

export interface LoginType {
    EMAIL: "email",
    GOOGLE: "google",
    FACEBOOK: "facebook",
    TWITTER: "twitter",
    SNAPCHAT: "snapchat",
    APPLE: "apple",
}

export interface LookingFor {
    NOT_SPECIFIED: 0,
    FRIENDSHIP: 1,
    DATING: 2,
    RELATIONSHIP: 4,
    NETWORKING: 8,
}

export interface MemberListType {
    PRIVILEGED: "privileged",
    REGULAR: "regular",
    SILENCED: "silenced",
    BANNED: "banned",
    BOTS: "bots"
}

export interface MessageFilterTier {
    OFF: 0,
    RELAXED: 3,
    RECOMMENDED: 2,
    STRICT: 1,
}

export interface MessageType {
    TEXT_PLAIN: "text/plain",
    TEXT_HTML: "text/html",
    TEXT_IMAGE: "text/image_link",
    IMAGE_JPEG: "image/jpeg",
    IMAGE_GIF: "image/gif",
    AUDIO_AAC: "audio/aac",
    TEXT_VOICE: "text/voice_link",
    AUDIO_SPEEX: "audio/x-speex",
    IMAGE_JPEGHTML: "image/jpeghtml",
    APPLICATION_PALRINGO_GROUP_ACTION: "application/palringo-group-action",
    APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK: "application/palringo-interactive-message-pack",
    TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE: "text/palringo-private-request-response",
}

export interface OnlineState {
    OFFLINE: 0,
    ONLINE: 1,
    AWAY: 2,
    INVISIBLE: 3,
    BUSY: 5,
    IDLE: 9,
}

export interface Privilege {
    SUBSCRIBER: 1,
    BOT_TESTER: 2,
    GAME_TESTER: 4,
    CONTENT_SUBMITER: 8,
    SELECTCLUB_1: 16,
    ELITECLUB_1: 64,
    RANK_1: 128,
    VOLUNTEER: 512,
    SELECTCLUB_2: 1024,
    ALPHA_TESTER: 2048,
    STAFF: 4096,
    TRANSLATOR: 8192,
    DEVELOPER: 16384,
    ELITECLUB_2: 131072,
    PEST: 262144,
    VALID_EMAIL: 524288,
    PREMIUM_ACCOUNT: 1048576,
    VIP: 2097152,
    ELITECLUB_3: 4194304,
    USER_ADMIN: 16777216,
    GROUP_ADMIN: 33554432,
    BOT: 67108864,
    ENTERTAINER: 536870912,
    SHADOW_BANNED: 1073741824,
}

export interface Relationship {
    NOT_SPECIFIED: 0,
    SINGLE: 1,
    RELATIONSHIP: 2,
    ENGAGED: 3,
    MARRIED: 4,
    COMPLICATED: 5,
    OPEN: 6,
}

export interface SearchType {
    GROUP: "group",
    SUBSCRIBER: "subscriber",
}

export interface StageBroadcastState {
    IDLE: 0,
    PLAYING: 1,
    PAUSED: 2
}

export interface StageConnectionState {
    INITIALISING: "initialising",
    DISCONNECTED: "disconnected",
    CONNECTING: "connecting",
    CONNECTED: "connected",
    READY: "ready"
}

export interface TipDirection {
    SENT: "sent",
    RECEIVED: "received",
}

export interface TipPeriod {
    ALL_TIME: "alltime",
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
}

export interface TipType {
    CHARM: "charm",
    SUBSCRIBER: "subscriber",
    GROUP: "group",
}

export interface TopicPageRecipeType {
    EVENT: "event",
    GROUP: "group",
    PRODUCT: "product"
}


export interface WolfstarTalent {
    MUSIC: 1;
    ENTERTAINMENT: 2;
    TALK_SHOW: 3;
    STORY_TELLING: 4;
    VOICE_OVER: 5;
    POETRY: 6;
    COMEDY: 7;
    IMITATING_VOICES: 7;
}
//#endregion
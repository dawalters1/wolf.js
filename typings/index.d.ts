import { StatusCodes } from "http-status-codes";

//#region Clients

export class Multimedia {
    public upload(route: String, body: Object): Promise<Response<Object|undefined>>;
}

export class Websocket {
    public emit(command: String, body: Object): Promise<Response<Object|undefined>>;
}

export class WOLF {

    public websocket: Websocket;
    public multimedia: Multimedia;

    public achievement: AchievementHelper;
    public banned: BannedHelper;
    public charm: CharmHelper;
    public contact: ContactHelper;
    public discovery: DiscoveryHelper;
    public event: EventHelper;
    public group: GroupHelper;
    public messaging: MessagingHelper;
    public notification: NotificationHelper;
    public phrase: PhraseHelper;
    public stage: StageHelper;
    public store: StoreHelper;
    public subscriber: SubscriberHelper;
    public tipping: TippingHelper;

    public utility: Utility;

    public currentSubscriber: Subscriber;

    public login(): void;
    public logout(): Promise<void>;
}

//#endregion

//#region Command 

export class Command {
    constructor(phraseName: String, callbackObject: {group: Object, private: Object, both: Object}, children: Array<Command>);

    public phraseName: String;
    public callbackObject: {
        group: Object, 
        private: Object, 
        both: Object
    };
    public children: Array<Command>;
}

export class CommandHandler {

    public register(commands: Array<Command>) : void;
    public isCommand(message: Message): Boolean;
}

//#endregion

//#region Constants

export interface AdminAction {
    REGULAR : 0,
    ADMIN : 1,
    MOD : 2,
    BAN : 4,
    SILENCE : 8,
    KICK : 16,
    JOIN : 17,
    LEAVE : 18,
    OWNER : 32,
}

export interface Capability {
    NOT_MEMBER : -1,
    REGULAR : 0,
    ADMIN : 1,
    MOD : 2,
    BANNED : 4,
    SILENCED : 8,
    OWNER : 32,
}

export interface Category {
    NOT_SPECIFIED : 0,
    BUSINESS : 8,
    EDUCATION : 10,
    ENTERTAINMENT : 26,
    GAMING : 12,
    LIFESTYLE : 13,
    MUSIC : 14,
    NEWS_AND_POLITICS : 15,
    PHOTOGRAPHY : 16,
    SCIENCE_AND_TECH : 25,
    SOCIAL_AND_PEOPLE : 17,
    SPORTS : 19,
    TRAVEL_AND_LOCAL : 18,
}

export interface DeviceType {
    OTHER : 0,
    BOT : 1,
    IPHONE : 5,
    IPAD : 6,
    ANDROID : 7,
    WEB : 8,
}
  
export interface TipContextType {
    MESSAGE : "message",
    STAGE : "stage",
}

export interface EmbedType {
    IMAGE_PREVIEW : "imagePreview",
    GROUP_PREVIEW : "groupPreview",
    LINK_PREVIEW : "linkPreview",
}
  
export interface Gender {
    NOT_SPECIFIED : 0,
    MALE : 1,
    FEMALE : 2,
}
  
export interface Language {
    NOT_SPECIFIED : 0,
    ENGLISH : 1,
    GERMAN : 3,
    SPANISH : 4,
    FRENCH : 6,
    POLISH : 10,
    CHINESE_SIMPLIFIED : 11,
    RUSSIAN : 12,
    ITALIAN : 13,
    ARABIC : 14,
    PERSIAN_FARSI : 15,
    GREEK : 16,
    PORTUGUESE : 17,
    HINDI : 18,
    JAPANESE : 19,
    LATIN_SPANISH : 20,
    SLOVAK : 21,
    CZECH : 22,
    DANISH : 24,
    FINNISH : 25,
    HUNGARIAN : 27,
    BAHASA_INDONESIA : 28,
    MALAY : 29,
    DUTCH : 30,
    NORWEGIAN : 31,
    SWEDISH : 32,
    THAI : 33,
    TURKISH : 34,
    VIETNAMESE : 35,
    KOREAN : 36,
    BRAZILIAN_PORTUGUESE : 37,
    ESTONIAN : 39,
    KAZAKH : 41,
    LATVIAN : 42,
    LITHUANIAN : 43,
    UKRAINIAN : 44,
    BULGARIAN : 45,
}
  
export interface LoginType {
    EMAIL : "email",
    GOOGLE : "google",
    FACEBOOK : "facebook",
    TWITTER : "twitter",
    SNAPCHAT : "snapchat",
    APPLE : "apple",
}

export interface LookingFor {
    NOT_SPECIFIED : 0,
    FRIENDSHIP : 1,
    DATING : 2,
    RELATIONSHIP : 4,
    NETWORKING : 8,
}
  
export interface MessageFilterTier {
    OFF : 0,
    RELAXED : 3,
    RECOMMENDED : 2,
    STRICT : 1,
}
  
export interface MessageLinkingType {
    EXTERNAL: 'external',
    SUBSCRIBER_PROFILE: 'subscriberProfile',
    SUBSCRIBER_CHAT: 'subscriberChat',
    GROUP_PROFILE: 'groupProfile',
    GROUP_CHAT: 'groupChat' 
}
  
export interface MessageType {
    TEXT_PLAIN : "text/plain",
    TEXT_HTML : "text/html",
    TEXT_IMAGE : "text/image_link",
    IMAGE_JPEG : "image/jpeg",
    IMAGE_GIF : "image/gif",
    AUDIO_AAC : "audio/aac",
    TEXT_VOICE : "text/voice_link",
    AUDIO_SPEEX : "audio/x-speex",
    IMAGE_JPEGHTML : "image/jpeghtml",
    APPLICATION_PALRINGO_GROUP_ACTION : "application/palringo-group-action",
    APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK : "application/palringo-interactive-message-pack",
    TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE : "text/palringo-private-request-response",
}
  
export interface OnlineState {
    OFFLINE : 0,
    ONLINE : 1,
    AWAY : 2,
    INVISIBLE : 3,
    BUSY : 5,
    IDLE : 9,
}
  
export interface Privilege {
    SUBSCRIBER : 1,
    BOT_TESTER : 2,
    GAME_TESTER : 4,
    CONTENT_SUBMITER : 8,
    SELECTCLUB_1 : 16,
    ELITECLUB_1 : 64,
    RANK_1: 128,
    VOLUNTEER : 512,
    SELECTCLUB_2 : 1024,
    ALPHA_TESTER : 2048,
    STAFF :4096,
    TRANSLATOR : 8192,
    DEVELOPER : 16384,
    ELITECLUB_2 : 131072,
    PEST : 262144,
    VALID_EMAIL : 524288,
    PREMIUM_ACCOUNT : 1048576,
    VIP : 2097152,
    ELITECLUB_3 :4194304,
    USER_ADMIN : 16777216,
    GROUP_ADMIN : 33554432,
    BOT : 67108864,
    ENTERTAINER : 536870912,
    SHADOW_BANNED : 1073741824,
}
  
export interface Relationship {
    NOT_SPECIFIED : 0,
    SINGLE : 1,
    RELATIONSHIP : 2,
    ENGAGED : 3,
    MARRIED : 4,
    COMPLICATED : 5,
    OPEN : 6,
}
  
export interface SearchType {
    GROUP : "group",
    SUBSCRIBER : "subscriber",
}
  
export interface TipDirection {
    SENT : "sent",
    RECEIVED : "received",
}
  
export interface TipPeriod {
    ALL_TIME : "alltime",
    DAY : "day",
    WEEK : "week",
    MONTH : "month",
}
  
export interface TipType {
    CHARM : "charm",
    SUBSCRIBER : "subscriber",
    GROUP : "group",
}

//#endregion

//#region Helper

export class BaseHelper {
    public constructor(client: WOLF, defaultCacheValue: Array<any> | Object);

    public client: WOLF;
    public cache: Array<any> | Object;
}

export class AchievementHelper extends BaseHelper {

    public cateogry: AchievementCategoryHelper;
    public group: AchievementGroupHelper;
    public subscriber: AchievementSubscriberHelper;

    public getById(id: Number, language: Language): Promise<Achievement>;
    public getByIds(ids: Number | Array<Number>, language: Language): Promise<Array<Achievement>>;
}

export class AchievementCategoryHelper extends BaseHelper {
    public getList(language: Language): Promise<Array<AchievementCategory>>;
}

export class AchievementGroupHelper extends BaseHelper {    
    public getById(targetGroupId: Number, parentId?: Number): Promise<Array<AchievementUnlockable>>;
}

export class AchievementSubscriberHelper extends BaseHelper {
    public getById(subscriberId: Number, parentId?: Number): Promise<Array<AchievementUnlockable>>;
}

export class AuthorizationHelper extends BaseHelper {
    public list(): Promise<Array<Number>>;
    public clear(): Promise<void>;
    public isAuthorized(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public authorize(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public unauthorize(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
}

export class BannedHelper extends BaseHelper {
    public list(): Promise<Array<Number>>;
    public clear(): Promise<void>;
    public isBanned(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public ban(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public unban(targetSubscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
}

export class CharmHelper extends BaseHelper {

    public list(): Promise<Array<Charm>>;
    public getById(id: Number): Promise<Charm>;
    public getByIds(ids: Number | Array<Number>): Promise<Array<Charm>>;
    public getSubscriberSummary(subscriberId: Number): Promise<CharmSummary>
    public getSubscriberStatistics(subscriberId: Number): Promise<CharmStatistics>;
    public getSubscriberActiveList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmExpiry>>;
    public getSubscriberExpiredList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmExpiry>>;
    public delete(charmIds: Number | Array<Number>): Promise<Response>;
    public set(charms: CharmSelected): Promise<Response>;
}

export class ContactHelper extends BaseHelper {
    public blocked: BlockedHelper;
    public list(): Promise<Array<Contact>>;
    public isContact(subscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public add(subscriberId: Number): Promise<Response>;  
    public delete(subscriberId: Number): Promise<Response>;

}

export class BlockedHelper extends BaseHelper {
    public list(): Promise<Array<Contact>>;
    public isBlocked(subscriberIds: Number|Array<Number>): Promise<Boolean|Array<Boolean>>;
    public block(subscriberId: Number): Promise<Response>;  
    public unblock(subscriberId: Number): Promise<Response>;
}

export class DiscoveryHelper extends BaseHelper {

}

export class EventHelper extends BaseHelper {
    public group: EventGroupHelper;
    public subscription: EventSubscriptionHelper;

    public getById(id: Number): Promise<Event>;
    public getByIds(ids: Number | Array<Number>): Promise<Array<Event>>;
}

export class EventGroupHelper extends BaseHelper {
    public getEventList(targetGroupId: Number): Promise<Array<Event>>;

    //TODO: create, edit, delete
}

export class EventSubscriptionHelper extends BaseHelper {
    public getList(): Promise<Array<Event>>;
    public add(eventId: Number): Promise<Response>;  
    public remove(eventId: Number): Promise<Response>;
}

export class GroupHelper extends BaseHelper {
    public list(): Promise<Array<Group>>;
    public getById(id: Number): Promise<Group>;
    public getByIds(ids: Number | Array<Number>): Promise<Array<Group>>;
    public getByName(name: String): Promise<Group>;

    public joinById(id: Number, password?: String): Promise<Response>;
    public joinByName(name: String, password?: String): Promise<Response>;

    public leaveById(id: Number): Promise<Response>;
    public leaveByName(name: String): Promise<Response>;

    public getChatHistory(id: Number, chronological: Boolean, timestamp?: Number, limit?: Number): Promise<Array<Message>>;

    public getStats(id: Number): Promise<GroupStats>

    public getRecommendationList(): Promise<Array<Group>>;
}

export class GroupMemberHelper extends BaseHelper {

}

export class MessagingHelper extends BaseHelper {

    public sendGroupMessage(targetGroupId: Number, content: String | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    public sendPrivateMessage(targetSubscriberId: Number, content: String | Buffer, options?: MessageSendOptions): Promise<Response<MessageResponse>>;
    //public sendMessage(commandOrMessage: Command | Message, content: String | Buffer, options: MessageSendOptions): Promise<Response<MessageResponse>>;
   
    public getGroupMessageEditHistory(targetGroupId: Number,timestamp: Number): Promise<Array<Message>>;
    
    public deleteGroupMessage(targetGroupId: Number,timestamp: Number): Promise<Response>;
    public restoreGroupMessage(targetGroupId: Number,timestamp: Number): Promise<Response>;
    
}

export class MessagingSubscriptionHelper extends BaseHelper {
    public nextMessage(predict: Function, tiemout?: Number): Promise<Message>;
    public nextGroupMessage(targetGroupId: Number, timeout?: Number): Promise<Message>;
    public nextPrivateMessage( sourceSubscriberId: Number, timeout?: Number): Promise<Message>;
    public nextGroupSubscriberMessage(targetGroupId: Number,  sourceSubscriberId: Number, timeout?: Number): Promise<Message>; 
}

export class NotificationHelper extends BaseHelper {

    public list(): Promise<Array<Notification>>;
    public clear(): Promise<Response>;
}

export class PhraseHelper extends BaseHelper {

    public localLoad(): void;
    public load(phrases: Array<Phrase>): void;
    //public count(): PhraseCount;
    public getAllByName(name: String):Array<Phrase>;
    public getByLanguageAndName(language: String, name: String): String;
    public getByCommandAndName(command: Command, name: String): String;
    public isRequestedPhrase(name: String, input: String): Boolean;


}

export class StageHelper extends BaseHelper {

    public request: StageRequestHelper;
    public slot: StageSlotHelper;

    //TODO: methods
}

export class StageSlotHelper extends BaseHelper {

    public list(targetGroupId: Number): Promise<Array<GroupAudioSlot>>;
    public get(targetGroupId: Number, slotId: Number): Promise<GroupAudioSlot>;

    public lock(targetGroupId: Number, slotId: Number): Promise<Response>;
    public unlock(targetGroupId: Number, slotId: Number): Promise<Response>;

    public mute(targetGroupId: Number, slotId: Number): Promise<Response>;
    public unmute(targetGroupId: Number, slotId: Number): Promise<Response>;
    
    public kick(targetGroupId: Number, slotId: Number): Promise<Response>;
    
    public join(targetGroupId: Number, slotId: Number, sdp: String): Promise<Response>;
    public consume(targetGroupId: Number, slotId: Number): Promise<Response>;
    public leave(targetGroupId: Number, slotId: Number): Promise<Response>;
    
}

export class StageRequestHelper extends BaseHelper {

    public list(targetGroupId: Number): Promise<Array<GroupAudioSlotRequest>>;
    public add(targetGroupId: Number, slotId: Number, subscriberId: Number): Promise<Response>;
    public delete(targetGroupId: Number, slotId: Number): Promise<Response>;
    public clear(targetGroupId: Number): Promise<Response>;
}

export class StoreHelper extends BaseHelper {

    public getCreditBalance() : Promise<Number>;
}

export class SubscriberHelper extends BaseHelper {
    public presence: SubscriberPresenceHelper;

    public getById(id: Number): Promise<Subscriber>;
    public getByIds(ids: Number | Array<Number>): Promise<Array<Subscriber>>;
    public getChatHistory(id: Number, timestamp?: Number, limit?: Number): Promise<Array<Message>>;

}

export class SubscriberPresenceHelper extends BaseHelper {
    public getById(id: Number): Promise<Presence>;
    public getByIds(ids: Number | Array<Number>): Promise<Array<Presence>>;
}

export class TippingHelper extends BaseHelper {

    public tip(targetSubscriberId: Number, targetGroupId: Number, context: TipContext, charms: TipCharm | Array<TipCharm>): Promise<Response>;
   
    public getDetails(id: Number, timestamp?: Number, limit?: Number, offset?: Number): Promise<TipDetail>;
    public getSummary(id: Number, timestamp?: Number, limit?: Number, offset?: Number): Promise<TipSummary>;

    public getGroupLeaderboard(id: Number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboard>;
    public getGroupLeaderboardSummary(id: Number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboardSummary>;
  
    public getGlobalLeaderboard(tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboard>;
    public getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<TipLeaderboardSummary>;

}

//#endregion

//#region Models

export class Base {
    public client: WOLF;
}

export class Achievement extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public parentId: Number;
    public typeId: Number;
    public name: String;
    public description: String;
    public imageUrl: String;
    public category: Number;
    public levelId: Number;
    public levelName: String;
    public acquisitionPercentage: Number;
}

export class AchievementCategory extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public name: String;
}

export class AchievementUnlockable extends Base {
    private constructor(client: WOLF, data: object);
 
    public id: Number;
    public additionalInfo: AchievementUnlockableAdditionalInfo;
}

export class AchievementUnlockableAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object);

    public awardedAt: Date;
    public eTag: String;
}

export class Charm extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public name: String;
    public productId: Number;
    public imageUrl: String;
    public descriptionPhraseId: Number;
    public descriptionList: Array<Translation>;
    public nameTranslationList: Array<Translation>;
    public weight: Number;
    public cost: Number;
}

export class CharmExpiry extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public charmId: Number;
    public subscriberId: Number;
    public sourceSubscriberId: Number;
    public expireTime: Date | undefined;
}

export class CharmSelected extends Base {
    private constructor(client: WOLF, data: object);

    public charmId: Number;
    public position: Number;
    
    private toJson() : Object;
}

export class CharmStatistics extends Base {
    private constructor(client: WOLF, data: object);

    public subscriberId: Number;
    public totalGiftedSent: Number;
    public totalGiftedReceived: Number;
    public totalLifetime: Number;
    public totalActive: Number;
    public totalExpired: Number;
}

export class CharmSummary extends Base {
    private constructor(client: WOLF, data: object);

    public charmId: Number;
    public total: Number;
    public expireTime: Date | undefined;
    public giftCount: Number;
}

export class Contact extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public additionalInfo: ContactAdditionalInfo;
}

export class ContactAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object);

    public hash: String;
    public nicknameShort: String;
    public onlineState: OnlineState;
    public privileges: Privilege;
}

export class Event extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public groupId: Number;
    public createdBy: Number;
    public title: String;
    public category: Number;
    public shortDescription: String;
    public longDescription: String;
    public imageUrl: String;
    public startsAt: Date;
    public endsAt: Date;
    public isRemoved: Boolean;
    public attendanceCount: Number;
    public createdAt: Date;
    public updatedAt: Date;
}

export class Group extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public hash: String;
    public name: String;
    public description: String;
    public reputation: Number;
    public owner: IdHash;
    public membersCount: Number;
    public official: Boolean;
    public peekable: Boolean;
    public premium: Boolean;
    public icon: Number;

    public extended: GroupExtended;
    public audioCounts: GroupAudioCounts;
    public audioConfig: GroupAudioConfig;
    public messageConfig: GroupMessageConfig;
}

export class GroupAudioConfig extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public enabled: Boolean;
    public stageId: Number | undefined;
    public minRepLevel: Number;
}

export class GroupAudioCounts extends Base {
    private constructor(client: WOLF, data: object);

    public broadcasterCount: Number;
    public consumerCount: Number;
    public id: Number;
}

export class GroupAudioSlot extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public locked: Boolean;
    public occupierId: Number | undefined;
    public occupierMuted: Boolean;
    public uuid: String;
    public connectionState: String;
    public reservedOccupierId: Number | undefined;
    public reservedExpiresAt: Date | undefined;

}

export class GroupAudioSlotRequest extends Base {
    private constructor(client: WOLF, data: object);

    public slotId: Number;
    public groupId: Number;
    public reservedOccupierId: Number;
    public reservedExpiresAt: Date;
}

export class GroupAudioSlotUpdate extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public slot: GroupAudioSlot;
}

export class GroupExtended extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public longDescription: String;
    public discoverable: Boolean;
    public language: Language;
    public category: Category;
    public advancedAdmin: Boolean;
    public questionable: Boolean;
    public locked: Boolean;
    public closed: Boolean;
    public passworded: Boolean;
    public entryLevel: Number;
}

export class GroupMember extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public hash: String;
    public capabilities: Capability;
}

export class GroupMessageConfig extends Base {
    private constructor(client: WOLF, data: object);

    public disableHyperlink: Boolean;
    public disableImage: Boolean;
    public disableImageFilter: Boolean;
    public disableVoice: Boolean;
    public id: Number;
    public slowModeRateInSeconds: Number;
}

export class GroupStats extends Base {
    private constructor(client: WOLF, data: object);

    public details: GroupStatsDetail;
    public next30: GroupStatsActive;
    public top25: GroupStatsTop;
    public topAction: GroupStatsTop;
    public topEmoticon: GroupStatsTop;
    public topHappy: GroupStatsTop;
    public topImage: GroupStatsTop;
    public topQuestion: GroupStatsTop;
    public topSad: GroupStatsTop;
    public topSwear: GroupStatsTop;
    public topText: GroupStatsTop;
    public topWord: GroupStatsTop;

    public trends: GroupStatsTrend;
    public trendsDay: GroupStatsTrend;
    public trendsHours: GroupStatsTrend;
}

export class GroupStatsActive extends Base {
    private constructor(client: WOLF, data: object);

    public actionCount: Number;
    public emoticonCount: Number;
    public groupId: Number;
    public happyEmoticonCount: Number;
    public imageCount: Number;
    public lineCount: Number;
    public message: String;
    public nickname: String;
    public randomQoute: String;
    public packCount: Number;
    public sadEmoticonCount: Number;
    public subId: Number;
    public swearCount: Number;
    public textCount: Number;
    public voiceCount: Number;
    public wordCount: Number;
}

export class GroupStatsDetail extends Base {
    private constructor(client: WOLF, data: object);

    public actionCount: Number;
    public emoticonCount: Number;
    public id: Number;
    public happyCount : Number;
    public imageCount : Number;
    public lineCount: Number;
    public memberCount: Number;
    public name: String;
    public owner: IdHash;
    public packCount: Number;
    public questionCount: Number;
    public spokenCount : Number;
    public sadCount: Number;
    public swearCount: Number;
    public textCount: Number;
    public voiceCount: Number;
    public wordCount: Number;
    public timestamp: Number;
}

export class GroupStatsTop extends Base {
    private constructor(client: WOLF, data: object);

    public nickname: String;
    public randomQoute: String;
    public subId: Number;
    public value: String | Number;
    public percentage: Number;
}

export class GroupStatsTrend extends Base {
    private constructor(client: WOLF, data: object);

    public day: Number;
    public hour: Number;
    public lineCount: Number;
}

export class IdHash extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public hash: String;

    public nickname: String;
}

export class LinkMetadata extends Base {
    private constructor(client: WOLF, data: object);

    public description: String;
    public domain: String;
    public imageSize: Number;
    public imageUrl: String;
    public isOfficial: Boolean;
    public title: String;
}

export class Message extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public body: String;
    public sourceSubscriberId: Number;
    public targetGroupId: Number;
    public embeds: Array<MessageEmbed>
    public metadta: MessageMetadata;
    public isGroup: Boolean;
    public timestamp: Number;
    public edited: MessageEdit;
    public type: MessageType;

    public isCommand: Boolean;
}

export class MessageEdit extends Base {
    private constructor(client: WOLF, data: object);

    public subscriberId: Number;
    public timestamp: Number;
}

export class MessageEmbed extends Base {
    private constructor(client: WOLF, data: object);

    public type: String;
    public groupId: Number;
    public url: String;
    public title: String;
    public image: Buffer;
    public body: String;
}

export class MessageMetadata extends Base {
    private constructor(client: WOLF, data: object);

    public formatting: MessageMetadataFormatting;

    public isDeleted: Boolean;
    public isEdited: Boolean;
    public isSpam: Boolean;
    public isTipped: Boolean;
}

export class MessageMetadataFormatting extends Base {
    private constructor(client: WOLF, data: object);

    public groupLinks: MessageMetadataFormattingGroupLink;
    public links: MessageMetadataFormattingUrl;
}

export class MessageMetadataFormattingGroupLink extends Base {
    private constructor(client: WOLF, data: object);

    public start: Number;
    public end: Number;
    public groupId: Number;
}

export class MessageMetadataFormattingUrl extends Base {
    private constructor(client: WOLF, data: object);

    public start: Number;
    public end: Number;
    public url: String;
}

export class MessageResponse extends Base {
    private constructor(client: WOLF, data: object);

    public uuid: String;
    public timestamp: Number;
}

export class MessageSendOptions {

}

export class MessageSetting extends Base {
    private constructor(client: WOLF, data: object);

    public spamFilter: MessageSettingFilter;
}

export class MessageSettingFilter extends Base {
    private constructor(client: WOLF, data: object);

    public enabled: Boolean;
    public tier: MessageFilterTier;
}

export class Notification extends Base {
    private constructor(client: WOLF, data: object);

    public actions: Array<NotificationAction>;
    public endAt: Date;
    public favourite: Boolean;
    public global: Boolean;
    public id: Number;
    public imageUrl: String;
    public layoutType: Number;
    public link: String;
    public message: String;
    public metadata: Object;
    public newsStreamType: Number;
    public persistent : Boolean;
    public startsAt: Date;
    public title: String;
    public type: Number;
}

export class NotificationAction extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public titleText: String;
    public actionUrl: String;
    public external: Boolean;
    public imageUrl: String;
}

export class Phrase extends Base {
    private constructor(client: WOLF, data: object);

    public name: String;
    public value: String;
    public language: Language;
}

export class Presence extends Base {
    private constructor(client: WOLF, data: object);

    public device: DeviceType;
    public state: OnlineState;
    public lastActive: Date;
    public subscriberId: Number;
}

export class Response<T = undefined> extends Base {
    private constructor(client: WOLF, data: object);

    public code: StatusCodes;
    public body: T;
    public headers: any;

    public success: Boolean;
}


export class Search extends Base {
    private constructor(client: WOLF, data: object);

    public searchType: SearchType;
    public id: Number;
    public hash: String;
    public reason: String;
}

export class Subscriber extends Base {
    private constructor(client: WOLF, data: object);

    public charms: SubscriberSelectedCharm;
    public deviceType: DeviceType;
    public extended: SubscriberExtended;
    public hash: String;
    public icon: Number;
    public id: Number;
    public nickname: String;
    public onlineState: OnlineState;
    public reputation: Number;
    public privileges: Privilege;
    public status: String;

    public language: String;

    private toContact(): Object;
}

export class SubscriberEvent extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public groupId: Number;
    public additionalInfo: SubscriberEventAdditionalInfo;
}

export class SubscriberEventAdditionalInfo extends Base {
    private constructor(client: WOLF, data: object);

    public eTag: String;
    public endsAt: Date;
    public startsAt: Date;
}

export class SubscriberExtended extends Base {
    private constructor(client: WOLF, data: object);

    public about: String;
    public gender: Gender;
    public language: Language;
    public lookingFor: LookingFor;
    public name: String;
    public relationship: Relationship;
    public urls: Array<string>;
    public utcOffset: Number;
}

export class SubscriberSelectedCharm extends Base {
    private constructor(client: WOLF, data: object);
    
    public selectedList: Array<CharmSelected>;
}

export class TimerJob extends Base {
    private constructor(client: WOLF, job: object);

    public clinet: WOLF;

    public handler: String;
    public data: Object;
    public duration: Number;
    public timestmap: Number;
    public id: String;

    public remaining: Number;

    public cancel() : Promise<void>;

    public delay(duration: Number): Promise<void>;

}

export class Tip extends Base {
    private constructor(client: WOLF, data: object);

    public charmList: Array<TipCharm>;
    public groupId: Number;
    public isGroup: Boolean;
    public sourceSubscriberId: Number;
    public subscriberId: Number;
    public context: TipContext;
}

export class TipCharm extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public quantity: Number
    public credits: Number;
    public magnitude: Number;
    public subscriber: IdHash;
}

export class TipContext extends Base {
    private constructor(client: WOLF, data: object);

    public type: TipContextType;
    public id: Number;
}

export class TipDetail extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public list: Array<TipCharm>;
    public version: Number;
}

export class TipLeaderboard extends Base {
    private constructor(client: WOLF, data: object);

    public leaderboard: Array<TipLeaderboardItem>;
}

export class TipLeaderboardItem extends Base {
    private constructor(client: WOLF, data: object);

    public rank: Number;
    public charmId: Number;
    public quantity: Number;
    public credits: Number;
    public group: IdHash;
    public subscriber: IdHash;
}

export class TipLeaderboardSummary extends Base {
    private constructor(client: WOLF, data: object);

    public topGifters: Array<IdHash>;
    public topGroups: Array<IdHash>;
    public topSpenders: Array<IdHash>;
}

export class TipSummary extends Base {
    private constructor(client: WOLF, data: object);

    public id: Number;
    public charmList: Array<TipCharm>;
    public version: Number;
}

export class Translation extends Base {
    private constructor(client: WOLF, data: object);

    public languageId: Language;
    public text: String;
}

export class Welcome extends Base {
    private constructor(client: WOLF, data: object);

    public ip: String;
    public token: String;
    public country: String;
    public endpointConfig: WelcomeEndpoint;
    public subscriber: undefined | Subscriber;
}

export class WelcomeEndpoint extends Base {
    private constructor(client: WOLF, data: object);

    public avatarEndpoint: String;
    public mmsUploadEndpoint: String;
}

export class WOLFAPIError extends Error {
    private constructor(error: Error, param: object| undefined);

    public params: Object|undefined;
}

//#endregion

//#region Utility

export class Utility {

    public array: ArrayUtility;
    //public download: DownloadUtility;
    public group: GroupUtility;
    public number: NumberUtility;
    public string: StringUtility; 
    public timer: TimerUtility;

    public toLanguageKey(languageId: Language): String;
    public delay(time: Number, type: 'milliseconds'|'seconds'): Promise<void>;
    public toReadableTime(language: String, time: Number,  type: 'milliseconds'|'seconds'|'minutes'|'hours'|'days'|'weeks'|'months'|'years'): String;
}

export class ArrayUtility {
    public chunk(array: Array<any>, length: Number): Array<Array<any>>;
    public shuffle(array: Array<any>): Array<any>;
    public getRandom(array: Array<any>, amount: Number): any | Array<any>
    public join(arrays: Array<Array<any>>): Array<any>;
    public reverse(array: Array<any>): Array<any>;
    public take(array: Array<any>, length: Number): any | Array<any>
    public includes(array: Array<any>, object: Object): Boolean;
}

export class GroupUtility {
    public avatar(targetGroupId: Number, size: Number): Promise<Buffer>;
    public member: GroupMemberUtility;
}

export class GroupMemberUtility {
    public hasCapability(targetGroupId: Number, targetSubscriberId: Number, capability: Capability, checkStaff: Boolean, checkAuthorized: Boolean): Promise<Boolean>;
}

export class NumberUtility{

    public toEnglishNumbers(arg: Number|String): Number|String;
    public toArabicNumbers(arg: Number|String): String;
    public toPersianNumbers(arg: Number|String): String;
    public addCommas(arg: Number|String): Number|String;
    public random(min: Number, max: Number): Number;
    public clamp(number: Number, lower: Number, upper: Number): Number;
}

export class StringUtility {
    public replace(string: String, replacements: { [key: string]: String|Number}): String;
    public isEqual(sideA: String, sideB: String): Boolean;
    public chunk(string: String, length: Number, splitChar: String, joinChar: String): Array<String>;
    public trimAds(string: String): String;
    public getValidUrl(string: String): {
        url: String,
        hostname: String
    };
    public getAds(string: String): Array<any>;
    public sanitise(string: String): String;
}

export class TimerUtility {
    public initialise(handlers: Object, ...args: any): Promise<void>;
    public add(name: String, handler: String, data: Object, duration: Number): Promise<TimerJob>
    public cancel(name: String): Promise<void>;
    public get(name: String): Promise<TimerJob|undefined>;
    public delay(name: String, duration: Number): Promise<TimerJob|void>
}

//#endregion

//#region Validator 

  export function isType(arg: any, type: 'String' | 'Undefined'| 'Null'| 'Boolean'| 'Number'|'BigInt'|'Function'|'Object'): Boolean;
  export function isNull(arg: any):Boolean;
  export function isNullOrUndefined(arg: any):Boolean;
  export function isNullOrWhitespace(arg: String):Boolean;
  export function isLessThanOrEqualZero(arg: Number):Boolean;
  export function isLessThanZero(arg: Number):Boolean;
  export function isValidNumber(arg: String | Number, acceptDecimals: Boolean):Boolean;
  export function isBuffer(arg: Buffer | String):Boolean
  export function isValidUrl(api: WOLF, arg: String):Boolean
  export function isValidAd(arg: String):Boolean
  export function isValidBoolean(arg: Number| Boolean): Boolean
  export function isValidDate(arg: Date | Number):Boolean;
  export function isValidHex(arg: String | Number):Boolean;
  export function isValidEmoji(arg: String):Boolean;
  export function isEqual(sideA: String, sideB: String):Boolean;

//#endregion
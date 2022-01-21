/**
 * Typings support for 1.0.0
 * Created: 8/11/21
 * Updated: 9/1/22
 */

import type { Readable } from "stream";
  
export class ResponseObject<T = undefined> {
  private constructor();
 
  public code: Number;
  public body: T;
  public headers: Object;
 
  public success: Boolean;
}
 
 //#region Command
export class Command {
  public constructor(trigger: String, commandCallBacks: {group: (command: CommandObject, ...args: any) => void,  private: (command: CommandObject, ...args: any) => void, both: (command: CommandObject, ...args: any) => void }, children: Array<Command>)
}

export class CommandObject {
  private constructor(commandContext: Object);

  public isGroup: Boolean;
  public language: String;
  public argument: String;
  public message: MessageObject;
  public targetGroupId: Number;
  public sourceSubscriberId: Number;
  public timestamp: Number;
  public type: String;
}

export class CommandHandler{
  private constructor();
  /**
   * Determine whether or not the message starts with a command
   * @param message - The message
   */
  public isCommand(message: MessageObject) : Boolean;
  public register(Commands: Command): void;
}

export class CommandContextObject{
  public isGroup: Boolean;
  public language: String;
  public argument: String;
  public message: MessageObject;
  public targetGroupId: Number;
  public sourceSubscriberId: Number;
  public timestamp: Number;
  public type: MessageType;
}
 
 //#endregion
 
 //#region Objects
export class AchievementObject{
  public acquisitionPercentage: Number;
  public category: Number;
  public description: String;
  public id: Number;
  public imageUrl: String;
  public levelId: Number;
  public levelName: String;
  public name: String;
  public parentId: Number;
  public typeId: Number;
}

export class AchievementUnlockableObject{
  public id: Number;
  public additionalInfo: 
     {
         eTag: String,  
         awardedAt: Date,  
         categoryId: Number 
     }
}

export class AchievementCategoryObject {
  public id: Number;
  public name: String;
}

export class BlacklistItemObject{
  public id: Number;
  public regex: String
}

export class CharmSelectedObject{
  public position: Number;
  public charmId: Number;
}

export class CharmObject{
  public cost: Number;
  public description: String;
  public id: Number;
  public imageUrl: String;
  public name: String;
  public productId: Number;
}

export class CharmSubscriberObject {
  public charmId: Number;
  public expireTime: Date;
  public id: Number;
  public sourceSubscriberId: Number;
  public subscriberId: Number;
}

export class CharmSubscriberStatisticsObject {
  public subscriberId: Number;
  public totalActive: Number;
  public totalExpired: Number;
  public totalGiftedReceived: Number;
  public totalGiftedSent: Number;
  public totalLifeTime: Number;
}

export class CharmSubscriberSummaryObject{
  public charmId: Number;
  public expireTime: Date;
  public giftCount: Number;
  public total: Number;
}

export class ConfigCommandSettingsObject {
  public ignoreOfficialBots: Boolean;
  public ignoreUnofficialBots: Boolean;
  public processOwnMessages: Boolean;
}

export class ConfigMessageSettingsObject {
  public processOwnMessages: Boolean;
} 

export class ConfigAppObject {
  public developerId: Number;
  /**
   * @deprecated
   * @use {commandSettings.processOwnMessages or messageSettings.processOwnMessages}
   */
  public processOwnMessages: Boolean;
  public defaultLanguage: String;
  public commandSettings: ConfigCommandSettingsObject;
  public messageSettings: ConfigMessageSettingsObject;
}

export class ConfigObject {
  public keyword: String;
  public app: ConfigAppObject;

  /**
   * Get a property from config
   * @param path - The path to the property in the config to get
   */
  public get(path: String): any;
}
 
export class ConfigOptionsObject {
  public keyword: String;
  public processOwnMessages: Boolean;
  public ignoreOfficialBots: Boolean;
  public ignoreUnofficialBots: Boolean;
  public developerId: Number;
}

export class CognitoObject{
  public token: String;
  public identity: String;
}

export class DiscoveryRecipeObject{
  public type: String;
  public idList: Number;
}

export class DiscoverySectionElementObject{
  public onInvalid: String;
  public aspect: 
     {
         width: Number;
         height: Number,
       };
  public link: 
     {
         url: String,
         text: String,
     }
  public autoplay: Boolean;
  public muted: Boolean;
  public loop: Boolean;
  public context: String;
  public url: String;
  public recipe: 
     {
         id: Number,
         min: Number;
         max: Number;
     }
  public size: String;
  public style: String;
  public type: String;
  public foregroundColour: String;
  public backgroundColour: String;
 
}

export class DiscoverySectionObject{
  public id: Number;
  public validity :
     {
         fromTime: Date;
         endTime: Date,
     }
  /**
   * Key Value pairs
   * Refer to elementType enum
   */
  public elements: { [key:string]: DiscoverySectionElementObject}
}

export class DiscoveryObject{
  public title: String;
  public name: String;
  public section: Array<DiscoverySectionObject>;
}
 
export class EventGroupObject {
  public id: Number;
  public additionalInfo :
     {
         eTag: String;
         startsAt: Date;
         endsAt: Date
     }
 
  /**
   * Only available when creating, updating events
   */
  public thumbnailUpload: ResponseObject;
}

export class EventObject {
  public attendanceCount: Number;
  public category: Number;
  public createdBy: Number;
  public endsAt: Date;
  public startsAt: Date;
  public groupId: Number;
  public id: Number;
  public imageUrl: String;
  public isRemoved: Boolean;
  public longDescription: String;
  public shortDescription: String;
  public title: String;
}

export class FormattedUrlObject {
  public url: String;
  public hostname: String;
}

export class GroupAdminActionObject{
  public groupId: Number;
  public sourceId: Number;
  public targetId: Number;
  public action: String;
}

export class GroupProfileBuilder {
  public setName(name: String): GroupProfileBuilder;
  public setTagLine(tagLine: String): GroupProfileBuilder;
  public setDescription(description: String): GroupProfileBuilder;
  public setCategory(category: Category): GroupProfileBuilder;
  public setLanguage(language: Language): GroupProfileBuilder;
  public setEntryLevel(entryLevel: Number): GroupProfileBuilder;
  public setAdvancedAdmin (isEnabled: Boolean): GroupProfileBuilder;
  public setDiscoverable(isEnabled: Boolean): GroupProfileBuilder;
  public setConversationPreview(isEnabled: Boolean): GroupProfileBuilder;
  public setStageState(isEnabled: Boolean): GroupProfileBuilder;
  public setStageLevel(level: Number): GroupProfileBuilder;
  public create() : Promise<ResponseObject>;
  public save(): Promise<ResponseObject>;
}

export class GroupSubscriberAdditionalInfoObject{
  public hash: String;
  public nickname: String;
  public privileges: Number;
  public onlineState: OnlineState;
}

export class GroupSubscriberObject{
  public id: Number;
  public groupId: Number;
  public additionalInfo: GroupSubscriberAdditionalInfoObject;
  public capabilities: Capability;
}

export class GroupAudioConfigObject{
  public id: Number;
  public enabled: Boolean;
  public minRepLevel: Number;
  public stageId: Number;
  public sourceSubscriberId: Number;
}

export class GroupAudioCountObject{
  public id: Number;
  public consumerCount: Number;
  public broadcasterCount: Number;
}
 
export class GroupAudioRequestObject{
  public slotId: Number;
  public reservedOccupierId: Number;
  public reservedExpiresAt: Date;
}
 
export class GroupAudioSlotObject{
  public id: Number;
  public locked: Number;
  public occupierId: Number;
  public occupierMuted: Boolean;
  public uuid: String;
  public connectionState: String;
  public reservedExpiresAt: Date;
  public reservedOccupierId: Number;
}

export class GroupExtendedObject{
  public discoverable: Boolean;
  public advancedAdmin: Boolean;
  public locked: Boolean;
  public questionable: Boolean;
  public entryLevel: Number;
  public passworded: Boolean;
  public language: Language;
  public longDescription: String
  public id: Number;
}

export class GroupObject{
  public exists: Boolean;
  public id: Number;
  public name: String;
  public icon: Number;
  public hash: String;
  public description: String;
  public reputation: Number;
  public members: Number;
  public subscribers: Array<GroupSubscriberObject>;
  public official: Boolean;
  public owner: IdHashObject;
  public peekable: Boolean;
  public extended: GroupExtendedObject;
  public audioConfig: GroupAudioConfigObject;
  public audioCount: GroupAudioCountObject;
  public inGroup: Boolean;
  public capabilities: Capability;
  public language: String;
 
  public toDisplayName(withId: Boolean): String;
  public sendMessage(content: String | Buffer, opts : MessageOptionsObject): Promise<ResponseObject<MessageResponseObject>>;
  public update(): GroupProfileBuilder;
  public join(password: String): Promise<ResponseObject>;
  public leave(): Promise<ResponseObject>;
  public getAvatar(size: Number): Promise<Buffer>
  public updateAvatar(avatar: Buffer): Promise<ResponseObject>
}

export class GroupStatsActiveSubscriberObject {
  public actionCount: Number;
  public emoticonCount: Number;
  public groupId: Number;
  public happyEmoticonCount: Number;
  public imageCount: Number;
  public lineCount: Number;
  public message: String;
  public nickname: String;
  public packCount: Number;
  public questionCount: Number;
  public randomQoute: String;
  public sadEmoticonCount: Number;
  public subId: Number;
  public swearCount: Number;
  public textCount: Number;
  public voiceCount: Number;
  public wordCount: Number;
}

export class GroupStatsTopSubscriberObject {
  public nickname: String;
  public percentage: Number;
  public subId: Number; 
  public value: Number;
  public randomQoute: String;
}

export class GroupStatsObject{
  public details : 
     {
         actionCount: Number;
         emoticonCount: Number;
         happyCount: Number;
         id: Number;
         imageCount: Number;
         lineCount: Number;
         memberCount: Number;
         name: String;
         owner: {subId: Number, level: Number, nickname: String}
         packCount: Number;
         questionCount: Number;
         sadCount: Number;
         spokenCount: Number;
         swearCount: Number;
         textCount: Number;
         timestamp: Number;
         voiceCount: Number;
         wordCount: Number;
       };
  public next30: Array<GroupStatsActiveSubscriberObject>;
  public top25: Array<GroupStatsActiveSubscriberObject>;
  public topAction: Array<GroupStatsTopSubscriberObject>;
  public topEmoticon: Array<GroupStatsTopSubscriberObject>;
  public topHappy: Array<GroupStatsTopSubscriberObject>;
  public topImage: Array<GroupStatsTopSubscriberObject>;
  public topQuestion: Array<GroupStatsTopSubscriberObject>;
  public topSad: Array<GroupStatsTopSubscriberObject>;
  public topSwear: Array<GroupStatsTopSubscriberObject>;
  public topText: Array<GroupStatsTopSubscriberObject>;
  public topWord: Array<GroupStatsTopSubscriberObject>;
  public trends:  Array<{ day: number, lineCount: Number}>
  public trendsDay:  Array<{ day: number, lineCount: Number}>
  public trendsHour: Array<{ hour: number, lineCount: Number}>
}

export class IdHashObject{
  public id: Number;
  public hash: String;
  /**
   * Not always provided
   */
  public nickname: String;
}

export class LinkMetadataObject{
  public description: String; 
  public domain: String; 
  public imageSize: String; 
  public imageUrl: String; 
  public isOfficial: Boolean; 
  public title: String
}

export class MessageLinkingObject{
  public start: Number;
  public end: Number;
  public value: String | Number;
  public MessageLinkingType: MessageLinkingType
} 

export class MessageSettingsObject{
  public spamFilter: 
     {
         enabled: Boolean;
         tier: MessageFilterTier
     }
}

export class MessageOptionsObject {
  public chunk: Boolean;
  public chunkSize: Number;
  public includeEmbeds: Boolean;
  public links: Array<MessageLinkingObject>
}

export class MessageResponseObject {
  public uuid: String;
  public timestamp: Number;
}

export class MessageEmbedObject{
  public type: EmbedType;
  public groupId: Number;
  public url: String;
  public title: String;
  public image: Buffer;
  public body: String;
}

export class MessageFormattingGroupLinkObject{
  public start: Number;
  public end: Number;
  public groupId: String;
}

export class MessageFormattingLinkObject{
  public start: Number;
  public end: Number;
  public url: String;
}

export class MessageFormattingObject {
  public groupLinks: Array<MessageFormattingGroupLinkObject>;
  public links: Array<MessageFormattingLinkObject>;
}

export class MessageMetadataObject{
  public formatting: MessageFormattingObject;
  public isDeleted: Boolean;
  public isSpam: Boolean;
  public isTipped: Boolean;
}

export class MessageEditObject{
  public subscriberId: Number;
  public timestamp: Number;
}

export class MessageObject {
  public id: string;
  public body: String;
  public sourceSubscriberId:  Number;
  public targetGroupId: Number;
  public embeds: Array<MessageEmbedObject>;
  public metadata: MessageMetadataObject;
  public isGroup: Boolean;
  public timestamp: Number;
  public edited: MessageEditObject;
  public type: MessageType;
  public isCommand: Boolean;
}

export class NotificationObject {
  public actions: 
     Array<
         {
             id: Number,
             titleText: String;
             actionUrl: String;
             external: Boolean;
             imageUrl: String
         }
     >;
  public endAt: Date;
  public favourite: Boolean;
  public global: Boolean;
  public id: Number;
  public imageUrl: String;
  public layoutType: Number;
  public link: String;
  public message: String;
  /**
   * Unsure what the object layout is
   */
  public metadata: Object;
  public newsStreamType: Number;
  public persistent: Boolean;
  public startsAt: Date;
  public title: String;
  public type: Number;
}

export class PhraseObject {
  public name: String;
  public value: String;
  public language: String;
}

export class PhraseCountObject {
  /**
   * example: {"en": 15, "ar": 4}
   */
  public countByLanguage: { [key: string]: number}
  public total: Number;
}

export class SearchObject
 {
  public type: SearchType;
  public id: Number; 
  public hash: String;
  public reason: String
}

export class StageGroupObject{
  public id: Number;
  public expireTime: Date;
}

export class StageObject{
  public id: Number;
  public name: String;
  public schemaUrl: String;
  public imageUrl: String;
  public productId: Number;
}

export class StageClientUpdatedObject{
  public slotId: Number;
  public duration: Number;
  public sourceSubscriberId: Number;
  public targetGroupId: Number;
}

export class StageClientViewerObject{
  public targetGroupId: Number;
  public count: Number;
}

export class StageSlotRequestObject{
  public subscriberId: Number;
  public hash: String;
  public expiresAt: Date;
}  

export class SubscriberProfileBuilder {
  private constructor(api: WOLFBot, subscriber: SubscriberObject);
  public setNickname(nickname: String): SubscriberProfileBuilder;
  public setAbout(about: String) : SubscriberProfileBuilder;
  public setName(name: String): SubscriberProfileBuilder;
  public setStatus(status: String) : SubscriberProfileBuilder;
  public setLanguage(language: Language): SubscriberProfileBuilder;
  public setRelationship(relationship: Relationship): SubscriberProfileBuilder;
  public setGender(gender: Gender): SubscriberProfileBuilder;
  public setLookingFor(lookingFor: LookingFor): SubscriberProfileBuilder;
  public setUrls(urls: Array<String>): SubscriberProfileBuilder;
  public addUrl(url: String): SubscriberProfileBuilder;
  public removeUrl(url: string): SubscriberProfileBuilder;
  public save(): Promise<ResponseObject>;
}

export class SubscriberObject {
  private constructor(api: WOLFBot, subscriber: SubscriberObject);
 
  public exists: Boolean;
  public charms: { selectedList: Array<CharmSelectedObject> };
  public deviceType: DeviceType;
  public extended : 
     {  
         about: String;  
         gender: Gender;   
         language: Language; 
         lookingFor: LookingFor;  
         name: String; 
         relationship: Relationship; 
         urls: Array<String>; 
         utcOffset: Number;
       };
  public hash: String;
  public icon: Number;
  public id: Number;
  public nickname: String;
  public onlineState: OnlineState;
  public privileges: Number;
  public reputation: Number;
  public status: String;
  public language: String;
}

export class TimerJobObject{
  public handler: String;
  public data: Object;
  public delay: Number;
  public timestamp: Number;
  public id: String;
  public remaining: Number
}

export class TipDetailsObject {
  public id: Number;
  public charmList: Array<TipCharmObject>; 
  public version: Number;
}

export class TipSummaryObject {
  public id: Number;
  public list: Array<TipCharmObject>;
  public version: Number;
}

export class TipContextObject{
  public type: String;
  public id: Number;
}

export class TipCharmObject {
  public id: Number;
  public quantity: Number;
  public credits: Number;
  public magnitude: Number;
  public subscriber: IdHashObject
}

export class TipLeaderboardItemObject{
  public rank: Number;
  public charmId: Number;
  public quantity: Number;
  public credits: Number;
  public group: IdHashObject;
  public subscriber: IdHashObject;
}

export class TipLeaderboardSumamryObject{
  public topGifters: Array<IdHashObject>;
  public topGroups: Array<IdHashObject>;
  public topSpenders: Array<IdHashObject>;
}

export class TipLeaderboardObject{
  public leaderboard: Array<TipLeaderboardItemObject>
}

export class PresenceObject{
  public id: Number;
  public deviceType: DeviceType;
  public onlineState: OnlineState;
  public lastActive: Number;
}

export class WelcomeBannerObject{
  public notification:  {[key:string]: Object};
  public promotion:  {[key:string]: Object};
}

export class WelcomeEndpointConfigObject{  
  public avatarEndpoint: String;
  public mmsUploadEndpoint: String;
  public banner: WelcomeBannerObject;
}

export class WelcomeObject{
  public ip: String;
  public country: String;
  public token: String;
  public endpointConfig: WelcomeEndpointConfigObject;
  public loggedInUser: SubscriberObject;
}
 //#endregion
 
 //#region Client Typings
 
export class Handler {
  private constructor();
 
  private _handlers: Object;
  /**
   * @param packet [ string, object ]
   */
  public handle(packet: Object): void;
}

export class Websocket {
  private constructor();
  /**
   * Initialise client connections
   */
  private _init() : void;
  /**
   * Handles wildcard socket events
   */
  private _handler : Handler;
 
  /**
   * Send a request to the server
   * @param command - The command
   * @param data - The body
   */
  public emit(command: String, data: Object): Promise<ResponseObject>
}

export class MultiMediaService {
  private constructor();
 
  private _getCredentials(attempt: Number): Object;
  private _sendRequest(route: String, body: Object, attempt: Number): Promise<ResponseObject>;
  /**
   * Send a multimedia message
   * @param targetType - The message type
   * @param targetId - The group id or subscriber id
   * @param content - The buffer of the image or audio to send
   * @param mimeType - The buffer mimeType
   */
  public sendMessage(targetType: 'Group' | 'Private', targetId: Number, content: ArrayBuffer, mimeType: 'image/gif' | 'image/jpeg' | 'audio/x-m4a'): Promise<ResponseObject<MessageResponseObject>>;
  /**
   * Upload a group avatar
   * @param targetGroupId - The id of the group
   * @param avatar - The buffer of the avatar
   * @param mimeType - The buffer mimeType
   */
  public uploadGroupAvatar(targetGroupId: Number, avatar: Buffer, mimeType: 'image/gif' | 'image/jpeg'): Promise<ResponseObject>;
  /**
   * Upload a subscriber avatar
   * @param avatar - The buffer of the avatar
   * @param mimeType - The buffer mimeType
   */
  public uploadSubscriberAvatar(avatar: Buffer, mimeType: 'image/gif' | 'image/jpeg'): Promise<ResponseObject>;
  /**
   * Upload a group avatar
   * @param eventId - The id of the event
   * @param thumbnail - The buffer of the thumbnail
   * @param mimeType - The buffer mimeType
   */
  public uploadEventThumbnail(eventId: Number, thumbnail: Buffer, mimeType: 'image/jpeg'): Promise<ResponseObject>;
}

export class WOLFBot {
  public constructor();
 
  public websocket: Websocket;
  /**
   * @ignore
   */
  private multiMediaService(): MultiMediaService; 
  /**
   * Exposes the commandHandler methods
   */
  public commandHandler(): CommandHandler;
  /**
   * Exposes the achievement methods
   */
  public achievement(): Achievement;
  /**
   * Exposes the authorization methods
   */    
  public authorization(): Authorization;
  /**
   * Exposes the banned methods
   */    
  public banned(): Banned;
  /**
   * Exposes the blocked methods
   */    
  public blocked(): Blocked;
  /**
   * Exposes the charm methods
   */        
  public charm(): Charm;
  /**
   * Exposes the contact methods
   */  
  public contact(): Contact;
  /**
   * Exposes the discovery methods
   */      
  public discovery(): Discovery;
  /**
   * Exposes the event methods
   */          
  public event(): Event;
  /**
   * Exposes the group methods
   */       
  public group(): Group;
  /**
   * Exposes the messaging methods
   */          
  public messaging(): Messaging;
  /**
   * Exposes the notification methods
   */     
  public notification(): Notification;
  /**
   * Exposes the phrase methods
   */ 
  public phrase(): Phrase;
  /**
   * Exposes the stage methods
   */ 
  public stage(): Stage;
  /**
   * Exposes the store methods
   */     
  public store(): Store;
  /**
   * Exposes the subscriber methods
   */ 
  public subscriber(): Subscriber;
  /**
   * Exposes the tipping methods
   */    
  public tipping(): Tipping;
 
  /**
   * Login to an account
   * @param email - The email belonging to the account
   * @param password - The password belonging to the account 
   * @param onlineState - The online state to appear as 
   * @param loginType - The account type 
   * @param token - The token to use to log in (Automatically generated if not provided)
   */
  public login(email: String, password: String, onlineState: OnlineState, loginType: LoginType, token: String): void;
 
  /**
   * Logout of the current account
   */
  public logout(): void;
  /**
   * Get the AWS congito token
   * @param requestNew - Whether or not to request new information from server
   */
  public getSecurityToken(requestNew: Boolean): Promise<CognitoObject>
  /**
   * Change the bots online state
   * @param onlineState - The online state
   */
  public setOnlineState(onlineState: OnlineState): Promise<ResponseObject>
  /**
   * Search group a group or user
   * @param query - The term to look for
   */
  public search(query: String): Promise<ResponseObject<Array<SearchObject>>>
  /**
   * Get information about a link
   * @param link - The link to look up
   */
  public getLinkMetadata(link: String): Promise<ResponseObject<LinkMetadataObject>>;
  /**
   * Get the link blacklist
   * @param requestNew (Default: False)- Whether or not to request new information from server
   */
  public getLinkBlackList(requestNew?: Boolean): Promise<Array<BlacklistItemObject>>;
  /**
   * Get the bots message filter settings
   */
  public getMessageSettings(): Promise<ResponseObject<MessageSettingsObject>>;
  /**
   * Set the bots message filtering settings
   * @param messageFilterTier - The tier to set
   */
  public setMessageSettings(messageFilterTier: MessageFilterTier): Promise<ResponseObject>;
  /**
   * Update the bots avatar
   * @param avatar - The avatar 
   */
  public updateAvatar(avatar: Buffer): Promise<ResponseObject>;
  /**
   * Update the bots profile
   */
  public updateProfile(): SubscriberProfileBuilder;
  /**
   * Handle an event 
   * @param event - The event string
   * @param listener - The event handler
   */
  public on<evtStr extends keyof ClientEvents>(event: evtStr, listener: (...args: ClientEvents[evtStr]) => void): this;
 
  /**
   * The bots yaml configuration 
   */
  public config: ConfigObject;
 
  /**
   * Config Settings
   */
  public options: ConfigOptionsObject;
 
    /**
     * The current account logged in
     */
  public currentSubscriber: SubscriberObject;
 
  /**
   * Exposes the utility methods
   */
  public utility(): Utility;

  /**
   * Regex used to split a string at spaces, newlines, tabs & commas
   */
  public SPLIT_REGEX: RegExp;
}

export abstract class BaseHelper {
  public constructor(api: WOLFBot);
 
  private _api: WOLFBot;
  private _websocket: Websocket;
 
  private _cleanup(): void;
  private _process(...args: any): void;
 
}

export class AchievementSubscriber{
  private constructor(api: WOLFBot);
 
  /**
   * Get achievements belonging to a subscriber
   * @param subscriberId - The id of the subscriber
   */
  public getById(subscriberId: Number): Promise<Array<AchievementUnlockableObject>>
}

export class AchievementGroup{
  private constructor(api: WOLFBot);
 
  /**
   * Get achievements belonging to a group
   * @param targetGroupId - The id of the group
   */
  public getById(targetGroupId: Number): Promise<Array<AchievementUnlockableObject>>
}

export class Achievement extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Exposes the group achievement methods
   */
  public group() : AchievementGroup;
  /**
   * Exposes the subscriber achievement methods
   */
  public subscriber(): AchievementSubscriber;
  /**
   * Get the achievement category list
   * @param language - The language of the categories
   * @param requestNew - Whether or not to request new data from the server
   */
  public getCategoryList(language: Language, requestNew?: Boolean): Promise<Array<AchievementCategoryObject>>;
  /**
   * Get an achievement
   * @param achievementId - The id of the achievement
   * @param language - The language of the achievement
   * @param requestNew - Whether or not to request new data from the server
   */
  public getById(achievementId: Number, language: Language, requestNew?: Boolean): Promise<AchievementObject>;
  /**
   * Get multiple achievements
   * @param achievementIds - The ids of the achievements
   * @param language - The language of the achievements
   * @param requestNew - Whether or not to request new data from the server
   */
  public getByIds(achievementIds: Array<Number>, language: Language, requestNew?: Boolean):  Promise<Array<AchievementObject>>;
}

export class Authorization extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the list of authorized users
   */
  public list(): Promise<Array<Number>>;
  /**
   * Clear the list of authorized users
   */
  public clear(): void;
  /**
   * Check whether or not a subscriber is authorized
   * @param subscriberIds - The id or ids of the subscribers to check
   */
  public isAuthorized(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Authorize a subscriber (Subscriber bypasses permission checks)
   * @param subscriberIds - The id or ids of the subscribers to authorize
   */
  public authorize(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Unauthorize a subscriber (Subscriber no longer bypasses permission checks)
   * @param subscriberIds - The id or ids of the subscribers to unauthorize
   */
  public unauthorize(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
}

export class Banned extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the list of banned users
   */
  public list(): Promise<Array<Number>>;
  /**
   * Clear the list of banned users
   */
  public clear(): void;
  /**
   * Check whether or not a subscriber is banned
   * @param subscriberIds - The id or ids of the subscribers to check
   */
  public isBanned(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Ban a subscriber (Subscriber wont be able to use commands)
   * @param subscriberIds - The id or ids of the subscribers to ban
   */
  public ban(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Unban a subscriber (Subscriber will be able to use commands)
   * @param subscriberIds - The id or ids of the subscribers to unauthorize
   */    
  public unban(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
}

export class Blocked extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the bots blocked list
   */
  public list(): Promise<Array<GroupSubscriberObject>>;
  /**
   * Check whether or not a subscriber is blocked
   * @param subscriberIds - The id or ids of the subscribers to check
   */
  public isBlocked(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Block a subscriber (They wont be able to PM the bot)
   * @param subscriberId - The id of the subscriber to block
   */
  public block(subscriberId: Number) :  Promise<ResponseObject>
  /**
   * Unblock a subscriber (They will be able to PM the bot)
   * @param subscriberId - The id of the subscriber to block
   */
  public unblock(subscriberIds: Number | Array<Number>) : Promise<ResponseObject>;
}

export class Charm extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the list of charms
   * @param language - The language of charms
   * @param requestNew - Whether or not to request new data from the server
   */
  public list(language: Language, requestNew?: Boolean): Promise<Array<CharmObject>>;
  /**
   * Get a charm
   * @param charmId - The id of the charm
   * @param language - The language of the charm
   * @param requestNew - Whether or not to request new data from the server
   */
  public getById(charmId: Number, language: Language, requestNew?: Boolean): Promise<CharmObject>;
  /**
   * Get multiple charms
   * @param charmIds - The ids of the charms
   * @param language - The language of the charms
   * @param requestNew - Whether or not to request new data from the server
   */
  public getByIds(charmIds: Number | Array<Number>, language: Language, requestNew?: Boolean): Promise<CharmObject | Array<CharmObject>>
  /**
   * Get the charms & how many of each a subscriber has
   * @param subscriberId - The id of the subscriber
   */
  public getSubscriberSummary(subscriberId: Number): Promise<CharmSubscriberSummaryObject>;
  /**
   * Get the gifting statistics of a subscriber
   * @param subscriberId - The id of the subscriber
   */
  public getSubscriberStatistics(subscriberId: Number): Promise<CharmSubscriberStatisticsObject>;
  /**
   * Get the list of active charms a subscriber has
   * @param subscriberId - The id of the subscriber
   * @param limit - (Default: 15) How many to request at one time
   * @param offset - Position of where to request from
   */
  public getSubscriberActiveList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmSubscriberObject>>;
  /**
   * Get the list of expired charms a subscriber has
   * @param subscriberId - The id of the subscriber
   * @param limit - (Default: 15) How many to request at one time
   * @param offset - Position of where to request from
   */    
  public getSubscriberExpiredList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmSubscriberObject>>;
  /**
   * Delete charms from your active or expired list
   */
  public remove(charmIds: Number | Array<Number>): Promise<ResponseObject>;
  /**
   * Set the charms that appear over the bots avatar
   */    
  public set(charms: CharmSelectedObject | Array<CharmSelectedObject>): Promise<ResponseObject>;
}

export class Contact extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the bots contact list
   */
  public list(): Promise<Array<GroupSubscriberObject>>;
  /**
   * Check whether or not a subscriber is a contact
   * @param subscriberIds - The id or ids of the subscribers to check
   */
  public isContact(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
  /**
   * Add a subscriber as a contact
   * @param subscriberId - The id of the subscriber
   */
  public add(subscriberId: Number) :  Promise<ResponseObject>
  /**
   * Remove a subscriber as a contact
   * @param subscriberId - The id of the subscriber
   */    
  public remove(subscriberIds: Number | Array<Number>) : Promise<ResponseObject>;
}

export class Discovery extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Get the discovery section
   * @param language - The language of the discovery list
   * @param requestNew - Whether or not to request new data from the server
   */
  public getByLanguage(language: Language, requestNew?: Boolean): Promise<DiscoveryObject>;
  /**
   * Get the idList of events & groups belonging to a discovery recipe id
   * @param id - The id of the recipe
   * @param language - The language of the discovery page
   * @param requestNew - Whether or not to request new data from the server
   */
  public getRecipe(id: Number, language: Language, requestNew?: Boolean): Promise<DiscoveryRecipeObject>;
  /**
   * Get the idList of events & groups belonging to a discovery section
   * @param id - The id of the recipe
   * @param language - The language of the discovery page
   * @param requestNew - Whether or not to request new data from the server
   */
  public getRecipeBySectionId(id: Number, language: Language, requestNew?: Boolean): Promise<DiscoverySectionObject>;
}

export class Event extends BaseHelper {
  private constructor(api: WOLFBot);
  /**
   * Create an event for a group
   * @param targetGroupId - The id of the group
   * @param title - The name of the event
   * @param startsAt - The time the event starts
   * @param endsAt - The time the event ends
   * @param shortDescription - A short description about the event
   * @param longDescription - A longer description about the event
   * @param thumbnail - The thumbnail of the event
   */
  public create(targetGroupId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
  /**
   * Edit an event belonging to a group
   * @param targetGroupId - The id of the group the event belongs too
   * @param eventId - The id of the event
   * @param title - The name of the event
   * @param startsAt - The time the event starts
   * @param endsAt - The time the event ends
   * @param shortDescription - A short description about the event
   * @param longDescription - A longer description about the event
   * @param imageUrl - The existing URL for the event thumbnail
   * @param thumbnail - The new thumbnail of the event
   */
  public edit(targetGroupId: Number, eventId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, imageUrl?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
  /**
   * Update an events thumbnail
   * @param eventId - The id of the event to delete
   * @param thumbnail - The new thumbnail of the event
   */    
  public updateThunbmail(eventId: Number, thumbnail: Buffer): Promise<ResponseObject>;
  /**
   * Delete an event 
   * @param targetGroupId - The id of the group the event belongs too
   * @param eventId - The id of the event
   */
  public remove(targetGroupId: Number, eventId: Number): Promise<ResponseObject<EventGroupObject>>;
  /**
   * Get an event 
   * @param eventId - The id of the event
   * @param requestNew - Whether or not to request new data from the server
   */    
  public getById(eventId: Number, requestNew?: Boolean): Promise<EventGroupObject>;
  /**
   * Get multiple events 
   * @param eventIds - The ids of the events
   * @param requestNew - Whether or not to request new data from the server
   */  
  public getByIds(eventIds: Number|Array<Number>, requestNew?: Boolean): Promise<EventGroupObject | Array<EventGroupObject>>;
  /**
   * Get the events list for a group
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getGroupEventList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<EventGroupObject>>;
  /**
   * Get the bots event subscription list
   * @param requestNew - Whether or not to request new data from the server
   */
  public getSubscriptionList(requestNew?: Boolean): Promise<Array<EventGroupObject>>;
  /**
   * Subscribe to an event
   * @param eventId - The id of the event
   */
  public subscribe(eventId: Number): Promise<ResponseObject>;
 /**
   * Unsubscribe to an event
   * @param eventId - The id of the event
   */
  public unsubscribe(eventId: Number): Promise<ResponseObject>;              
}

export class Group extends BaseHelper {
  private constructor(api: WOLFBot);
 
  /**
   * Get the list of groups the bot is in
   */
  public list(): Promise<Array<GroupObject>>;
  /**
   * Get a group
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getById(targetGroupId: Number, requestNew?: Boolean): Promise<GroupObject>;
  /**
   * Get multiple groups
   * @param targetGroupIds - The ids of the groups
   * @param requestNew - Whether or not to request new data from the server
   */    
  public getByIds(targetGroupIds: Number |Array<Number>, requestNew?: Boolean) : Promise<Array<GroupObject>>;
  /**
   * 
   * @param targetGroupName - The name of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getByName(targetGroupName: String, requestNew?: Boolean): Promise<GroupObject>;
  /**
   * Join a group
   * @param targetGroupId - The id of the group
   * @param password - The password of the group
   */
  public joinById(targetGroupId: Number, password?: String): Promise<ResponseObject>;
  /**
   * Join a group
   * @param targetGroupName - The name of the group
   * @param password - The password of the group
   */    
  public joinByName(targetGroupName: String, password?: String): Promise<ResponseObject>
  /**
   * Leave a group
   * @param targetGroupId - The id of the group
   */
  public leaveById(targetGroupId: Number): Promise<ResponseObject>;
  /**
   * Leave a group
   * @param targetGroupName - The name of the group
   */       
  public leaveByName(targetGroupName: String): Promise<ResponseObject>
  /**
   * Get the chat history of a group 
   * @param targetGroupId - The id of the group
   * @param chronological - Whether or not to return in chronological order
   * @param timestamp - The timestamp of the last message
   * @param limit - (Default: 15, Min: 5, Max: 30) How many messages to request 
   */
  public getChatHistory(targetGroupId: Number, chronological: Boolean, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
  /**
   * Get the groups member list
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getSubscriberList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupSubscriberObject>>;
  /**
   * Get the groups chat stats
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getStats(targetGroupId: Number, requestNew?: Boolean): Promise<GroupStatsObject>
  /**
   * Create a group
   */
  public create(): GroupProfileBuilder;
  /**
   * Update a group
   * @param group - The group to update
   */
  public update(group: GroupObject): GroupProfileBuilder;
  /**
   * Update a groups avatar
   * @param targetGroupId - The id of the group
   * @param avatar - The new avatar
   */
  public updateAvatar(targetGroupId: Number, avatar: Buffer): Promise<ResponseObject>;
  /**
   * Update a groups capabilities
   * @param targetGroupId - The id of the group
   * @param targetSubscriberId - The id of the subscriber
   * @param capabilities - The new capabilities
   */
  public updateSubscriber(targetGroupId: Number, targetSubscriberId: Number, capabilities: AdminAction): Promise<ResponseObject>
  /**
   * Get recommended groups
   */
  public getRecommendedList(): Promise<Array<GroupObject>>
}

export class MessageSubscription extends BaseHelper{
  private constructor(api : WOLFBot);
  /**
   * Watch for a message using specific paramaters
   * @param predict - The paramaters ((message)=>message.isGroup && message.sourceSubscriberId === 80280172)
   * @param timeout - How long until the subscription ends (Default: Infinite)
  */
  public nextMessage(predict: Function, timeout?: Number ) : Promise<MessageObject>;
  /**
   * Watch for a message from a specific group
   * @param targetGroupId - The id of the group
   * @param timeout - How long until the subscription ends (Default: Infinite)
   */
  public nextGroupMessage(targetGroupId: Number, timeout?: Number ) : Promise<MessageObject>;
  /**
   * Watch for a message from a specific subscriber
   * @param sourceSubscriberId - The id of the subscriber
   * @param timeout - How long until the subscription ends (Default: Infinite)
   */    
  public nextPrivateMessage(sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
  /**
   * Watch for a message from a specific group and subscriber
   * @param targetGroupId - The id of the group
   * @param sourceSubscriberId - The id of the subscriber
   * @param timeout - How long until the subscription ends (Default: Infinite)
   */  
  public nextGroupSubscriberMessage(targetGroupId: Number, sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
}

export class Messaging extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Exposes the message subscription methods
   */
  public subscribe(): MessageSubscription;
  /**
   * Send a group message
   * @param targetGroupId - The id of the group
   * @param content - The text, image/audio buffer 
   * @param opts - The sending options (Text Only)
   */
  public sendGroupMessage(targetGroupId: Number, content: Buffer | String, opts?: MessageOptionsObject): Promise<ResponseObject<MessageResponseObject>>;    
  /**
   * Send a private message
   * @param targetSubscriberId - The id of the subscriber
   * @param content - The text, image/audio buffer 
   * @param opts - The sending options (Text Only)
   */   
  public sendPrivateMessage(targetSubscriberId: Number, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageResponseObject>>;
  /**
   * Send a message using command or message
   * @param commandOrMessage - The command or message to respond too
   * @param content - The text, image/audio buffer 
   * @param opts - The sending options (Text Only)
   */
  public sendMessage(commandOrMessage: CommandObject | MessageObject, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageResponseObject>>;
  /**
   * Accept a chat request
   * @param subscriberId - The id of the subscriber
   */
  public acceptPrivateMessageRequest(subscriberId: Number): Promise<ResponseObject<MessageResponseObject>>;
  /**
   * Delete a group message
   * @param targetGroupId - The id of the group
   * @param timestamp - The timestamp belonging to the message
   */
  public deleteGroupMessage(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageObject>>;
  /**
   * Restore a deleted message
   * @param targetGroupId - The id of the group
   * @param timestamp - The timestamp belonging to the message
   */
  public restoreGroupMessage(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageObject>>;
  /**
   * Get the last 10 actions done on a message
   * @param targetGroupId - The id of the group
   * @param timestamp - The timestamp belonging to the message
   */
  public getGroupMessageEditHistory(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageEditObject>>;  
}

export class Notification extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Request the notifications list
   * @param language - The language of the notifications
   * @param requestNew - Whether or not to request new data from the server
   */
  public list(language: Language, requestNew?: Boolean) : Promise<Array<NotificationObject>>;
  /**
   * Clears the notification list (All languages)
   */
  public clear(): Promise<ResponseObject>;
  /**
   * Subscribe to new notifications (10 minute checks)
   * @param language - The id of the notifications
   */
  public subscribe(language: Language): Promise<void>;
  /**
   * Unsubscribe from new notifications
   * @param language - The id of the notifications
   */
  public unsubscribe(language: Language): Promise<void>;
}

export class Phrase extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Get the list of phrases
   */
  public list(): Array<PhraseObject>;
  /**
   * Get the count of phrases per language and overall
   */
  public count(): Promise<PhraseCountObject>;
  /**
   * Clear the list of phrases
   */
  public clear(): Promise<void>;
  /**
   * Load phrases into the bot
   * @param phrases - The phrases to load
   */
  public load(phrases: Array<PhraseObject>): Promise<void>;
  /**
   * Get the list of languages
   */
  public getLanguageList(): Promise<Array<String>>;
  /**
   * Get all phrases with a specific name
   * @param name - The phrase name
   */
  public getAllByName(name: String): Array<PhraseObject>;
  /**
   * Get a specific phrase by language and name
   * @param language - The language of the phrase
   * @param name - The phrase name
   */
  public getByLanguageAndName(language: String, name: String): String;
  /**
   * Get a specific phrase using command and name
   * @param command - The command 
   * @param name - The phrase name
   */
  public getByCommandAndName(command: CommandObject, name: String): String;
  /**
   * Check whether or not a users input is a specific phrase
   * @param name - The phrase name
   * @param value - The user input string
   */
  public isRequestedPhrase(name: String, value: String): Boolean;
}
 
export class Stage extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Get group audio settings
   * @param targetGroupId - The id of the grooup
   * @param requestNew - Whether or not to request new data from the server
   */
  public getGroupSettings(targetGroupId: Number, requestNew?: Boolean): Promise<GroupAudioConfigObject>; 
  /**
   * Get the list of publicly available stages
   * @param requestNew  - Whether or not to request new data from the server
   */
  public getStageList(requestNew?: Boolean): Promise<Array<StageObject>>;  
  /**
   * Get the list of stages available to group
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getStageListForGroup(targetGroupId: Number, requestNew?: Boolean): Promise<Array<StageGroupObject>>; 
   /**
   * Get the slots for a group
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server 
   */
  public getGroupSlots(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupAudioSlotObject>>;       
  /**
   * Update a slots mute state
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot
   * @param isMuted - Whether or not the slot is muted
   */
  public updateSlotMuteState(targetGroupId: Number, slotId: Number, isMuted: Boolean): Promise<ResponseObject>;
  /**
   * Update a slots lock state
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot
   * @param isLocked - Whether or not the slot is locked
   */
  public updateSlotLockState(targetGroupId: Number, slotId: Number, isLocked: Boolean): Promise<ResponseObject>;
  /**
   * Leave a slot
   * @param targetGroupId - The id of the group
   */
  public leaveSlot(targetGroupId: Number): Promise<ResponseObject>;
  /**
   * Kick a specific slot in a group
   * @param targetGroupId - The group Id
   * @param slotId - The slot Id
   */
  public kickSlot(targetGroupId: Number, slotId: Number): Promise<ResponseObject>;    
  /**
   * Kick a slot using subscriber id
   * @param targetGroupId - The group Id
   * @param subscriberId - The id of the subscriber
   */
  public kickSubscriberFromStage(targetGroupId: Number, subscriberId: Number): Promise<ResponseObject>;      
  /**
   * Join a slot
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot
   * @param sdp - The sdp (Leave empty for internal handling)
   * @param opts - The ffmpeg settings
   */
  public joinSlot(targetGroupId: Number, slotId: Number, sdp?:String, opts?: Array<string> ): Promise<ResponseObject<GroupAudioSlotObject>>;
  /**
   * Listen to a slot
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot
   * @param sdp - The sdp belonging to the slot
   */
  public consumeSlot(targetGroupId: Number, slotId: Number, sdp: String): Promise<ResponseObject>;
  /**
   * Broadcast in a group
   * @param targetGroupId - The id of the group
   * @param data - The audio stream
   */
  public broadcast(targetGroupId: Number, data: Readable): void;
  /**
   * Pause the broadcast of a group
   * @param targetGroupId - The id of the group
   */
  public pause(targetGroupId: Number): Promise<StageClientUpdatedObject>; 
  /**
   * Resume a broadcast of a group
   * @param targetGroupId - The id of the group
   */
  public resume(targetGroupId: Number): Promise<StageClientUpdatedObject>;
  /**
   * Stop a broadcast of a group
   * @param targetGroupId - The id of the group
   */
  public stop(targetGroupId: Number): Promise<StageClientUpdatedObject>;
  /**
   * Check whether or not the client is ready to broadcast
   * @param targetGroupId - The id of the group
   */
  public isReady(targetGroupId: Number): Promise<Boolean>;
  /**
   * Check whether or not the client is paused
   * @param targetGroupId - The id of the group
   */
  public isPaused(targetGroupId: Number): Promise<Boolean>;
  /**
   * Update the groups stage client ffmpeg settings
   * @param targetGroupId - THe id of the group
   * @param opts - The array of options
   */
  public setClientOptions(targetGroupId: Number, opts: Array<string>): Promise<void>;

  /**
   * Get the groups stage client ffmpeg settings
   * @param targetGroupId - The id of the group
   */
  public getClientOptions(targetGroupId: Number): Promise<Array<string>>;

  /**
   * Check whether or not the client is playing
   * @param targetGroupId - The id of the group
   */
  public isBroadcasting(targetGroupId: Number): Promise<Boolean>;      
  /**
   * Check whether or not the client is connecting
   * @param targetGroupId - The id of the group
   */
  public isConnecting(targetGroupId: Number): Promise<Boolean>;
  /**
   * Check whether or not the client is connected
   * @param targetGroupId - The id of the group
   */
  public isConnected(targetGroupId: Number): Promise<Boolean>;
  /**
   * Check whether or not the client is paused
   * @param targetGroupId - The id of the group
   */
  public isPaused(targetGroupId: Number): Promise<Boolean>;  
  /**
   * Get the current broadcast duration
   * @param targetGroupId - The id of the group
   */
  public duration(targetGroupId: Number): Promise<Number>;
  /**
   * Check whether or not a client exists for a group
   * @param targetGroupId - The id of the group
   */
  public hasClient(targetGroupId: Number): Promise<Boolean>;
  /**
   * Get the slot id the bot occupies for a group
   * @param targetGroupId - The id of the group
   */
  public slotId(targetGroupId: Number): Promise<Number>;
  /**
   * Get the mic request list for a group (Get the join stage request list)
   * @param targetGroupId - The id of the group
   * @param requestNew - Whether or not to request new data from the server
   */
  public getMicRequestList(targetGroupId: Number, requestNew: Boolean): Promise<Array<StageSlotRequestObject>>
  /**
   * Request a mic in a group (Request to join the stage) (Expires after 5 minutes)
   * @param targetGroupId - The id of the group
   */
  public requestMic(targetGroupId: Number): Promise<ResponseObject>
  /**
   * Cancel a mic request (Cancel request to join the stage)
   * @param targetGroupId - The id of the group
   */
  public cancelMicRequest(targetGroupId: Number): Promise<ResponseObject>
  /**
   * Clear the mic request list for a group (Clear the request list)
   * @param targetGroupId - The id of the group
   */
  public clearMicRequestList(targetGroupId: Number): Promise<ResponseObject>
  /**
   * Request a user to join the stage (Expires after 30 seconds)
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot to assign to the user
   * @param subscriberId - The id of the subscriber to assign
   */
  public addSlotRequest(targetGroupId: Number, slotId: Number, subscriberId: Number): Promise<ResponseObject>
  /**
   * Cancel a user slot assign request
   * @param targetGroupId - The id of the group
   * @param slotId - The id of the slot to assign to the user
   */
  public cancelSlotRequest(targetGroupId: Number, slotId: Number): Promise<ResponseObject>
}

export class Store extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Get the credit balance
   * @param requestNew - Whether or not to request new data from the server
   */
  public getBalance(requestNew?: Boolean) : Number;
}

export class Subscriber extends BaseHelper {
  private constructor(api : WOLFBot);
 
  /**
   * Get the online state and device type for a subscriber
   * @param subscriberId - The id of the subscriber
   * @param requestNew - Whether or not to request new data from the server
   */
  public getPresenceById(subscriberId: Number, requestNew?: Boolean): Promise<PresenceObject>;
  /**
   * Get the online state and device type for multiple subscribers
   * @param subscriberIds - The id or ids of the subscriber
   * @param requestNew - Whether or not to request new data from the server
   */
  public getPresenceByIds(subscriberIds: Number |Array<Number>, requestNew?: Boolean) : Promise<Array<PresenceObject>>; 
  /**
   * Get a subscriber
   * @param subscriberId - The id of the subscriber
   * @param requestNew - Whether or not to request new data from the server
   */
  public getById(subscriberId: Number, requestNew?: Boolean): Promise<SubscriberObject>;
  /**
   * Get multiple subscribers
   * @param subscriberIds - The id or ids of the subscriber
   * @param requestNew - Whether or not to request new data from the server
   */
  public getByIds(subscriberIds: Number |Array<Number>, requestNew?: Boolean) : Promise<Array<SubscriberObject>>; 
  /**
   * Get the chat history of a subscriberId 
   * @param subscriberId - The id of the subscriberId
   * @param chronological - Whether or not to return in chronological order
   * @param timestamp - The timestamp of the last message
   * @param limit - (Default: 15, Min: 5, Max: 30) How many messages to request 
   */
  public getChatHistory(subscriberId: Number, chronological: Boolean, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
}

export class Tipping extends BaseHelper {
  private constructor(api : WOLFBot);
     
  /**
   * Add a tip to a message
   * @param subscriberId - The id of the subscriber
   * @param targetGroupId - The id of the group
   * @param context - The context of the tip
   * @param charms - The charms to give
   */
  public tip(subscriberId: Number, targetGroupId: Number, context: TipContextObject, charms: Array<TipCharmObject>): Promise<ResponseObject>;
  /**
   * Get tipping details for a message
   * @param targetGroupId - The id of the group
   * @param timestamp - The timestamp of the message
   * @param limit - How many tips to return
   * @param offset - The index where return tips should start
   */
  public getDetails(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<ResponseObject<TipDetailsObject>>;
  /**
   * Get tipping summary for a message
   * @param targetGroupId - The id of the group
   * @param timestamp - The timestamp of the message
   * @param limit - How many tips to return
   * @param offset - The index where return tips should start
   */    
  public getSummary(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<ResponseObject<{ [key: number]: ResponseObject<TipSummaryObject>}>>
  /**
   * Get group tipping leaderboard
   * @param targetGroupId - The id of the group
   * @param tipPeriod - The tipping period
   * @param tipType - The type of tips
   * @param tipDirection - The direction of tips sent/received
   */  
  public getGroupLeaderboard(targetGroupId: Number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboardObject>
  /**
   * Get group tipping leaderboard summary
   * @param targetGroupId - The id of the group
   * @param tipPeriod - The tipping period
   * @param tipType - The type of tips
   * @param tipDirection - The direction of tips sent/received
   */    
  public getGroupLeaderboardSummary(targetGroupId: Number, tipPeriod: TipPeriod, tipType: TipType, tipDirection: TipDirection): Promise<TipLeaderboardSumamryObject>
  /**
   * Get global tipping leaderboard
   * @param tipPeriod - The tipping period
   * @param tipType - The type of tips
   * @param tipDirection - The direction of tips sent/received
   */
  public getGlobalLeaderboard (tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection): Promise<TipLeaderboardObject>
  /**
   * Get global tipping leaderboard summary
   * @param tipPeriod - The tipping period
   */    
  public getGlobalLeaderboardSummary(tipPeriod: TipPeriod): Promise<TipLeaderboardSumamryObject>
}

export class AchievementUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Map achievements to their correct category
   * @param achievements - The achievements to map
   * @param language - The language of the achievements
   */
  public mapToCategories(achievements: Array<AchievementObject>, language: Language): Promise<Array<{id: Number, name: String, achievements: Array<AchievementObject>}>>;
}

export class ArrayUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Chunk an array into smaller arrays
   * @param array - The array
   * @param length - How long each array should be
   */
  public chunk(array: Array<any>, length: Number): Array<Array<any>>;

  /**
   * Shuffle an array
   * @param array - The array
   */
  public shuffle(array: Array<any>): Array<any>;

  /**
   * Get a random item from an array
   * @param array - The array
   */
  public getRandomIndex(array: Array<any>): any; 
}

export class DiscoveryUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Get all sections from the discovery page that contain a recipe id
   * @param language - The language of the discovery page
   * @param requestNew - Whether or not to request new data from the server
   */
  public getRecipeSections(language: Language, requestNew?: Boolean): Promise<Array<DiscoverySectionObject>>;
}

export class DownloadUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Download a file from url
   * @param url - The url
   */
  public file(url: String): Promise<Buffer>;
}

export class MemberUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Get a group member
   * @param targetGroupId - The id of the group
   * @param targetSubscriberId - The id of the subscriber
   */
  public get(targetGroupId: Number, targetSubscriberId: Number): GroupSubscriberObject;
  /**
   * Check whether or not a subscriber has the capability to use a command
   * @param targetGroupId - The id of the group
   * @param targetSubscriberId - The id of the subscriber
   * @param requiredCapability - The capability required
   * @param checkStaff - Whether or not to allow staff to bypass check
   * @param includeAuthorizedSubscribers - Whether or not to allow authorized users to bypass check
   */
  public hasCapability(targetGroupId: Number, targetSubscriberId: Number, requiredCapability: Capability, checkStaff?: Boolean, includeAuthorizedSubscribers?: Number): Promise<Boolean>; 
}

export class GroupUtility{
  private constructor(api: WOLFBot);
 
  /**
   * Exposes the member methods
   */
  public member(): MemberUtility;
  /**
   * Get a groups avatar
   * @param targetGroupId - The id of the group
   * @param size - The size of the image
   */
  public getAvatar(targetGroupId: Number, size: Number): Promise<Buffer>;
  /**
   * Convert group details into [groupName] (groupId) or [groupName]
   * @param group - The group
   * @param excludeId - Whether or not to include the groups ID
   */
  public toDisplayName(group: GroupObject, excludeId?: Boolean): String;
}

export class NumberUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Convert all numbers to english
   * @param arg - The string or number to convert
   */
  public toEnglishNumbers(arg: String|Number): Number | String;
  /**
   * Convert all numbers to arabic
   * @param arg - The string or number to convert
   */    
  public toArabicNumbers(arg: String|Number): Number| String;
  /**
   * Convert all numbers to persian
   * @param arg - The string or number to convert
   */        
  public toPersianNumbers(arg: String |Number): Number | String;
  /**
   * Add commas to a number
   * @param arg The string or number
   */
  public addCommas(arg: Number | String) : Number | String;
}

export class StringUtility{
  private constructor(api: WOLFBot);
 
  /**
   * Replace placeholders with appropriate data
   * @param string - The string to replace
   * @param replacements - Example: { nickname: 'Martin', subscriberId: 1 }
   */
  public replace(string: String, replacements: { [key: string]: String|Number}): String;
  /**
   * Check whether or not two strings are the same
   * @param sideA - The first string
   * @param sideB - The second string
   */
  public isEqual(sideA: String, sideB: String): Boolean;
  /**
   * Check a string into an array of smaller strings
   * @param string - The string to chunk
   * @param max - The length of the chunk
   * @param splitChar - The char to split at
   * @param joinChar - The char to join with
   */
  public chunk(string: String, max?: Number, splitChar?: String, joinChar?: String): Array<String>;
  /**
   * Remove ads from a string
   * @param string - The string
   */
  public trimAds(string: String): String;
  /**
   * Format a link to a valid format 
   * @param url - The url to format
   */
  public getValidUrl(url: String): FormattedUrlObject;
  /**
   * Get all ads from a string
   * @param url - The string
   */
  public getAds(arg: String): Array<string>;
}

export class PrivilegeUtility{
  private constructor(api: WOLFBot);
 
  /**
   * Check whether or not a subscriber has a privilege or privileges
   * @param targetSubscriberId - The id of the subscriber
   * @param privs - The privileges to check
   * @param requiresAll - Whether or not a subscriber should have all privileges provided
   */
  public has(targetSubscriberId: Number, privs: Array<Number>|Number, requiresAll?: Boolean): Promise<Boolean>
}

export class SubscriberUtility {
  private constructor(api: WOLFBot);
 
  /**
   * Exposes the privilege methods
   */
  public privilege(): PrivilegeUtility;
  /**
   * Get a subscriber avatar
   * @param subscriberId - The id of the group
   * @param size - The size of the image
   */    
  public getAvatar(subscriberId: Number, size: Number): Promise<Buffer>;
  /**
      Convert group details into nickname (id) or nickname
   * @param subscriber - The subscriber
   * @param trimAds - Whether or not to trim ads from the nickname
   * @param excludeId - Whether or not to show the subscribers id
   */    
  public toDisplayName(subscriber: SubscriberObject, trimAds?: Boolean, excludeId?: Boolean): String;
  /**
   * Check whether or not a subscriber has a charm or charms
   * @param targetSubscriberId - The id of the subscriber
   * @param charmIds - The id or ids of the charms to check
   * @param requiresAll - Whether or not a subscriber should have all charms provided
   */
  public hasCharm(targetSubscriberId: Number, charmIds: Array<Number>, requiresAll?: Boolean): Promise<Boolean>
}

export class TimerUtility{
  private constructor(api: WOLFBot);
  /**
   * Initialise the timer util
   * @param handlers - The handlers object
   * @param args - The additional paramaters to pass to the handlers
   */
  public initialise(handlers: Object, ...args: any): Promise<void>;
  /**
   * Add an event
   * @param name - The name of the event
   * @param handler - The handler that should handle the event
   * @param data - The data to pass to the handler
   * @param duration - How long until the event is fired
   */
  public add(name: String, handler: String, data: Object, duration: Number): Promise<TimerJobObject>
  /**
   * Cancel an event
   * @param name The name of the event
   */
  public cancel(name: String): Promise<void>;
  /**
   * Get an event
   * @param name The name of the event
   */
  public get(name: String): Promise<TimerJobObject>;
  /**
   * Delay an event
   * @param name - The name of the vent
   * @param duration - How long until the event should fire
   */
  public delay(name: String, duration: Number): Promise<TimerJobObject>
}

export class Utility {
  private constructor(api: WOLFBot);
 
  /**
   * Exposes the achievement methods
   */
  public achievement(): AchievementUtility;
  /**
   * Exposes the array methods
   */
  public array(): ArrayUtility;
  /**
   * Exposes the discovery methods
   */
  public discovery(): DiscoveryUtility;
  /**
   * Exposes the download methods
   */
  public download(): DownloadUtility;
  /**
   * Exposes the group methods
   */
  public group(): GroupUtility;
  /**
   * Exposes the number methods
   */
  public number(): NumberUtility;
  /**
   * Exposes the string methods
   */
  public string(): StringUtility;
  /**
   * Exposes the subscriber methods
   */
  public subscriber(): SubscriberUtility;
  /**
   * Exposes the timer methods
   */
  public timer(): TimerUtility;
  /**
   * Convert milliseconds into a display time (EX: 65000 - 1m 5s)
   * @param language - The language of the phrase
   * @param milliseconds - The time to convert
   */
  public toReadableTime(language: String, milliseconds: Number): String;
  /**
   * Sleep a method
   * @param duration - The time to delay
   */
  public delay(duration: Number): Promise<void>;
}

export namespace  Validator {
  /**
   * Check whether or not a arg is a specific type
   * @param arg - The arg
   * @param type - The type
   */
  export function isType(arg: any, type: 'String' | 'Undefined'| 'Null'| 'Boolean'| 'Number'|'BigInt'|'Function'|'Object'): Boolean;
  /**
   * Check to see if arg is null
   * @param arg - The item
   */
  export function isNull(arg: any):Boolean;
  /**
   * Check to see if arg is null or undefined
   * @param arg - The item
   */
  export function isNullOrUndefined(arg: any):Boolean;
  /**
   * Check to seeif arg is null or empty/whitespace
   * @param arg - The string 
   */
  export function isNullOrWhitespace(arg: String):Boolean;
  /**
   * Check to see if arg is less than or equal to 0
   * @param arg - The number
   */
  export function isLessThanOrEqualZero(arg: Number):Boolean;
  /**
   * Check to see if arg is less than 0
   * @param arg - The number
   */
  export function isLessThanZero(arg: Number):Boolean;
  /**
   * Check to see if arg is a valid number
   * @param arg - the number or string
   */
  export function isValidNumber(arg: String | Number, acceptDecimals: Boolean):Boolean;
  /**
   * Check to see if arg is a valid date
   * @param arg - The date or number
   */
  export function isValidDate(arg: Date | Number):Boolean;
  /**
   * Check to see if arg is a valid buffer
   * @param arg - The string or buffer
   */
  export function isBuffer(arg: Buffer | String):Boolean
  /**
   * Check to see if arg is a valid url
   * @param api - The bot instance
   * @param arg - The string or buffer
   */
  export function isValidUrl(api: WOLFBot, arg: String):Boolean
  /**
   * Check to see if arg is a valid ad
   * @param arg - The string or buffer
   */
  export function isValidAd(arg: String):Boolean
}

//#endregion
 
//#region enums
 
export const Constants: {
  AdminAction: AdminAction;
  Capability:Capability;
  Category: Category;
  ContextType:ContextType;
  DeviceType: DeviceType;
  EmbedType: EmbedType;
  Gender: Gender;
  Language: Language;
  LoginType: LoginType;
  LookingFor: LookingFor;
  MessageFilterTier: MessageFilterTier;
  MessageLinkingType: MessageLinkingType
  MessageType: MessageType;
  OnlineState: OnlineState;
  Privilege: Privilege;
  Relationship: Relationship;
  SearchType: SearchType;
  TipDirection: TipDirection;
  TipPeriod: TipPeriod;
  TipType: TipType;
}

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

export interface ContextType {
  MESSAGE : "message",
  STAGE : "stage",
}

export interface DeviceType {
  OTHER : 0,
  BOT : 1,
  IPHONE : 5,
  IPAD : 6,
  ANDROID : 7,
  WEB : 8,
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
 
//#region interfaces - Borrowed from Discord.JS setup - https=//github.com/discordjs/discord.js
// https://github.com/discordjs/discord.js/blob/main/typings/index.d.ts
 
export interface ClientEvents {
  /**
   * The socket connected to the server
   */
  connected: [],
  /**
   * The socket is connecting to the server
   */
  connecting: [],
  /**
   * An error occurred while the socket was connecting to the server
   */
  connectionError: [error: Error],
  /**
   * The socket didnt connect to the server in time
   */
  connectionTimeOut: [error: Error],
  /**
   * The socket was disconnected from the server
   */
  disconnected: [reason: String],
  /**
   * Groups audio count updated (Listener changed or someone joined a slot and is broadcasting)
   */
  groupAudioCountUpdate: [old: GroupAudioCountObject, new: GroupAudioCountObject],
 
  /**
   * A slot request was added
   */
  groupAudioRequestAdd: [group: Group, request: GroupAudioRequestObject],
 
  /**
   * A slot request was deleted
   */
  groupAudioRequestDelete: [group: Group, request: GroupAudioRequestObject],
 
  /**
   * A groups request slots list was cleared
   */
  groupAudioRequestListClear: [group: Group],
 
  /**
   * A slot request expired
   */
  groupAudioRequestExpire: [group: Group, request: GroupAudioRequestObject]
  /**
   * A slot was updated (User joined/left, muted or slot was locked)
   */
  groupAudioSlotUpdate: [old: GroupAudioSlotObject, new: GroupAudioSlotObject],
  /**
   * The groups audio configuration was updated
   */
  groupAudioUpdate: [old: GroupAudioConfigObject, new: GroupAudioConfigObject],
  /**
   * A group event has been created
   */
  groupEventCreate: [group: GroupObject, event: EventGroupObject],
  /**
   * A group event has been updated
   */
  groupEventUpdate: [group: GroupObject, old: EventGroupObject, new: EventGroupObject],
  /**
   * A group event has been removed/deleted
   */
  groupEventDelete: [group: GroupObject, event: EventGroupObject]
  /**
   * A subscriber has joined the group
   */
  groupMemberAdd: [group: GroupObject, subscriber: SubscriberObject],
  /**
   * A subscribers capability has been updated in a group 
   */
  groupMemberUpdate: [group: GroupObject, action: GroupAdminActionObject],
  /**
   * A subscriber left a group
   */
  groupMemberDelete:[group: GroupObject, subscriber: SubscriberObject],
  /**
   * A group message has been received
   */
  groupMessage: [message: MessageObject],
  /**
   * A group message has been updated
   */
  groupMessageUpdate: [message: MessageObject],
  /**
   * A tip has been added to a group message
   */
  groupTipAdd: [tip: object],
  /**
   * A groups profile has been updated
   */
  groupUpdate: [old: GroupObject, new: GroupObject],
  /**
   * An error has happened internally
   */
  internalError: [error: Error],
  /**
   * The bot joined a group
   */
  joinedGroup: [group: GroupObject],
  /**
   * The bot left a group
   */
  leftGroup: [group: GroupObject],
  /**
   * An item was added to logs
   */
  log: [log: string],
  /**
   * The bot failed to login
   */
  loginFailed: [response: ResponseObject],
  /**
   * The bot logged in successfully
   */
  loginSuccess: [subscriber: SubscriberObject],
  /**
   * A new notification was received
   */
  notificationReceived:[notification: NotificationObject],
  /**
   * A packet was received from the server
   */
  packetReceived: [command: string, body: object],
  /**
   * A packet was sent to the server
   */
  packetSent: [command: string, body: object],
  /**
   * Ping event
   */
  ping: [],
  /**
   * Pong event
   */
  pong: [latency: number],
  /**
   * A subscribers device or online state changed
   */
  presenceUpdate: [presence: PresenceObject],
  /**
   * A private message was received
   */
  privateMessage: [message: MessageObject],
  /**
   * Someone accepted a private message request
   */
  privateMessageAcceptResponse: [message: MessageObject],
  /**
   * A private message was updated (NOT IMPLEMENTED/NON-EXISTANT)
   */
  //privateMessageUpdate: [message: MessageObject],
  /**
   * A tip has been added to a private message (NOT IMPLEMENTED/NON-EXISTANT)
   */
  // privateTipAdd: [tip: object],
  /**
   * The client is ready for use
   */
  ready: [],
  /**
   * The socket reconnected to the server
   */
  reconnected: [],
  /**
   * The socket is attempting to reconnect to the server
   */
  reconnecting: [attempt: Number]
  /**
   * The socket failed to reconnect to the server
   */
  reconnectFailed: [error: object],
  /**
   * The bot has finished broadcasting in a group
   */
  stageClientBroadcastEnd: [change: StageClientUpdatedObject],
  /**
   * The bot has successfully joined a slot
   */
  stageClientConnected: [change: StageClientUpdatedObject],
  /**
   * The bot is attempting to join a slot
   */
  stageClientConnecting: [change: StageClientUpdatedObject],
  /**
   * The bot began broadcasting
   */
  stageClientBroadcastStart: [change: StageClientUpdatedObject],
  /**
   * The bot was disconnected from a slot
   */
  stageClientDisconnected: [change: StageClientUpdatedObject],
  /**
   * The bots broadcast duration has been updated
   */
  stageClientBroadcastDuration: [change: StageClientUpdatedObject],
  /**
   * The bot encountered an error while broadcasting
   */
  stageClientBroadcastError: [change: StageClientUpdatedObject],
  /**
   * The bot was kicked from a slot
   */
  stageClientKicked: [change: StageClientUpdatedObject],
  /**
   * The bots slot was muted
   */
  stageClientBroadcastMuted: [change: StageClientUpdatedObject],
  /**
   * The bots broadcast was paused
   */
  stageClientBroadcastPaused: [change: StageClientUpdatedObject],
  /**
   * The bot is ready to broadcast 
   */
  stageClientReady: [change: StageClientUpdatedObject],
  /**
   * The bot broadcast has been stopped
   */
  stageClientBroadcastStopped: [change: StageClientUpdatedObject],
  /**
   * The bots slot has been unmuted
   */
  stageClientBroadcastUnmuted: [change: StageClientUpdatedObject],
  /**
   * The bots broadcast has been resumed
   */
  stageClientBroadcastUnpaused: [change: StageClientUpdatedObject],
  /**
   * The bots listener count has changed 
   */
  stageClientBroadcastViewerCountChanged: [change: StageClientViewerObject],
  /**
   * A subscriber was added to the bots blocked list
   */
  subscriberBlockAdd: [subscriber: SubscriberObject],
  /**
   * A subscriber was removed from the bots blocked list
   */
  subscriberBlockDelete: [subscriber: SubscriberObject],
  /**
   * A subscriber was added to the bots contact list
   */
  subscriberContactAdd: [subscriber: SubscriberObject],
  /**
   * A subscriber was removed from the bots contact list
   */
  subscriberContactDelete: [subscriber: SubscriberObject],
  /**
   * An event was added to the bots subscription list
   */
  subscriberGroupEventAdd: [event: EventGroupObject],
  /**
   * An event was removed from the bots subscription list
   */
  subscriberGroupEventDelete: [event: EventGroupObject],
  /**
   * A subscribers profile has been updated
   */
  subscriberUpdate: [old: SubscriberObject, new: SubscriberObject],
  /**
   * The server welcomed the socket
   */
  welcome: [welcome: WelcomeObject],
}
 
//#endregion

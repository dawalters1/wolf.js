import type { Readable } from "stream";

export class ResponseObject<T = undefined> {
    private constructor();

    public code: Number;
    public body: T;
    public headers: Object;

    public success: Boolean;
}

export class IdHashObject{
    public id: Number;
    public hash: String;
    /**
     * Not always provided
     */
    public nickname: String;
}

//#region Message
export class MessageOptionsObject {
    public chunk: Boolean;
    public chunkSize: Number;
    public includeEmbeds: Boolean;
}
export class MessageResponseObject {
    public uuid: String;
    public timestamp: Number;
}
export class MessageEmbedObject{
    public type: String;
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
    public  sourceSubscriberId:  Number;
    public  targetGroupId: Number;
    public  embeds: Array<MessageEmbedObject>;
    public  metadata: MessageMetadataObject;
    public  isGroup: Boolean;
    public  timestamp: Number;
    public edited: MessageEditObject;
    public type: String;
    public isCommand: Boolean;
}
//#endregion

//#region Command
export class CommandObject {
    public constructor(trigger: String, commandCallbacks: Object, children: Array<CommandObject>);
}
export class CommandHandler{
    private constructor();

    /**
     * Determine whether or not the message starts with a command
     * @param message - The message
     */
    public isCommand(message: MessageObject) : Boolean;
    public register(commands: CommandObject): void;
}
export class CommandContextObject{
    public isGroup: Boolean;
    public language: String;
    public argument: String;
    public message: MessageObject;
    public targetGroupId: Number;
    public sourceSubscriberId: Number;
    public timestamp: Number;
    public type: String;
}

//#endregion

//#region Group 

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
    public totalGiftedRecieved: Number;
    public totalGiftedSent: Number;
    public totalLifeTime: Number;
}
export class CharmSubscriberSummaryObject{
    public charmId: Number;
    public expireTime: Date;
    public giftCount: Number;
    public total: Number;
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
     * Refer to @dawalters1/constants to view element types (EX: elements[elementType.sectionTitle])
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
    public groupId: Number;
    public id: Number;
    public imageUrl: String;
    public isRemoved: Boolean;
    public longDescription: String;
    public shortDescription: String;
    public title: String;
}
export class GroupProfileBuilder {
    public setName(name: String): GroupProfileBuilder;
    public setTagLine(tagLine: String): GroupProfileBuilder;
    public setDescription(description: String): GroupProfileBuilder;
    public setCategory(category: Number): GroupProfileBuilder;
    public setLanguage(language: Number): GroupProfileBuilder;
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
    public onlineState: Number;
}
export class GroupSubscriberObject{
    public id: Number;
    public groupId: Number;
    public additionalInfo: GroupSubscriberAdditionalInfoObject;
    public capabilities: Number;
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
    public language: Number;
    public longDescription: String
    public id: Number;
}
export class GroupObject{
    public exists: Boolean;
    public id: Number;
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
    public capabilities: Number;

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
    public voidCount: Number;
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
    public toImage: Array<GroupStatsTopSubscriberObject>;
    public topQuestion: Array<GroupStatsTopSubscriberObject>;
    public topSad: Array<GroupStatsTopSubscriberObject>;
    public topSwear: Array<GroupStatsTopSubscriberObject>;
    public topText: Array<GroupStatsTopSubscriberObject>;
    public topWord: Array<GroupStatsTopSubscriberObject>;
    public trends:  Array<{ day: number, lineCount: Number}>
    public trendsDay:  Array<{ day: number, lineCount: Number}>
    public trendsHour: Array<{ hour: number, lineCount: Number}>
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
}

export class SubscriberObject {
    private constructor(api: WOLFBot, subscriber: SubscriberObject);

    public exists: Boolean;
    public charms: { selectedList: Array<CharmSelectedObject> };
    public deviceType: Number;
    public extended : 
    {  
        about: String;  
        gender: Number;   
        language: Number; 
        lookingFor: Number;  
        name: String; 
        relationship: Number; 
        urls: Array<String>; 
        utcOffset: Number;
    };
    public hash: String;
    public icon: Number;
    public id: Number;
    public nickname: String;
    public onlineState: Number;
    public privileges: Number;
    public reputation: Number;
    public status: String;
}
export class TipDetailsObject {
    id: Number;
    charmList: Array<TipCharmObject>; 
    version: Number;
}
export class TipSummaryObject {
    id: Number;
    list: Array<TipCharmObject>;
    version: Number;
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
    public deviceType: Number;
    public onlineState: Number;
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
    public multiMediaService(): MultiMediaService; 

    public commandHandler(): CommandHandler;

    public achievement(): Achievement;
    public authorization(): Authorization;
    public banned(): Banned;
    public blocked(): Blocked;
    public charm(): Charm;
    public contact(): Contact;
    public discovery(): Discovery;
    public event(): Event;
    public group(): Group;
    public messaging(): Messaging;
    public notification(): Notification;
    public phrase(): Phrase;
   // public stage(): Stage;
    public store(): Store;
    public subscriber(): Subscriber;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link tipping}
    */
    public tip(): Tipping;
    public tipping(): Tipping;

    //public setSelectedCharms(charms: )//TODO;
    
    public on<evtStr extends keyof ClientEvents>(event: evtStr, listener: (...args: ClientEvents[evtStr]) => void): this;
}

export abstract class BaseHelper {
    public constructor(api: WOLFBot);

    private _api: WOLFBot;
    private _websocket: Websocket;

    private _cleanup(): void;
    public _process(...args: any): void;

}

export class AchievementSubscriber{
    private constructor(api: WOLFBot);

    public getById(subscriberId: Number): Promise<Array<AchievementUnlockableObject>>
}

export class AchievementGroup{
    private constructor(api: WOLFBot);

    public getById(targetGroupId: Number): Promise<Array<AchievementUnlockableObject>>
}

export class Achievement extends BaseHelper {
    private constructor(api: WOLFBot);

    public group() : AchievementGroup;
    public subscriber(): AchievementSubscriber;
    public getCategoryList(language: Number, requestNew?: Boolean): Promise<Array<AchievementCategoryObject>>;
    public getById(achievementId: Number, language: Number, requestNew?: Boolean): Promise<AchievementObject>;
    public getByIds(achievementIds: Array<Number>, language: Number, requestNew?: Boolean):  Promise<Array<AchievementObject>>;
}

export class Authorization extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(): Promise<Array<Number>>;
    public clear(): void;
    public isAuthorized(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public authorize(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public unauthorize(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
}
export class Banned extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(): Promise<Array<Number>>;
    public clear(): void;
    public isBanned(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public ban(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public unban(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
}
export class Blocked extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(): Promise<Array<GroupSubscriberObject>>;
    public isBlocked(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public block(subscriberId: Number) :  Promise<ResponseObject>
    public unban(subscriberIds: Number | Array<Number>) : Promise<ResponseObject>;
}
export class Charm extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(language: Number, requestNew?: Boolean): Promise<Array<CharmObject>>;
    public getById(charmId: Number, language: Number, requestNew?: Boolean): Promise<CharmObject>;
    public getByIds(charmIds: Number | Array<Number>, language: Number, requestNew?: Boolean): Promise<CharmObject | Array<CharmObject>>
    public getSubscriberSumamry(subscriberId: Number): Promise<CharmSubscriberSummaryObject>;
    public getSubscriberStatistics(subscriberId: Number): Promise<CharmSubscriberStatisticsObject>;
    public getSubscriberActiveList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmSubscriberObject>>;
    public getSubscriberExpiredList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<CharmSubscriberObject>>;
    public remove(charmIds: Number | Array<Number>): Promise<ResponseObject>;
    public set(charms: CharmSelectedObject | Array<CharmSelectedObject>): Promise<ResponseObject>;
}
export class Contact extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(): Promise<Array<GroupSubscriberObject>>;
    public isContact(subscriberIds: Number | Array<Number>) : Promise<Boolean | Array<Boolean>>;
    public add(subscriberId: Number) :  Promise<ResponseObject>
    public remove(subscriberIds: Number | Array<Number>) : Promise<ResponseObject>;
}

export class Discovery extends BaseHelper {
    private constructor(api : WOLFBot);

    public getByLanguage(language: Number, requestNew?: boolean): Promise<DiscoveryObject>;
    public getRecipe(id: Number, language: Number, requestNew?: boolean): Promise<DiscoveryRecipeObject>;
    public getRecipeBySectionId(id: Number, language: Number, requestNew?: boolean): Promise<DiscoverySectionObject>;
}

export class Event extends BaseHelper {
    private constructor(api: WOLFBot);

    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link create}
    */
    public createEvent(targetGroupId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
    public create(targetGroupId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link edit}
    */
    public editEvent(targetGroupId: Number, eventId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, imageUrl?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
    public edit(targetGroupId: Number, eventId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, imageUrl?: String, thumbnail?: Buffer): Promise<ResponseObject<EventGroupObject>>
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link updateThumbnail}
    */
    public updateEventThunbmail(eventId: Number, thumbnail: Buffer): Promise<ResponseObject>;
    public updateThunbmail(eventId: Number, thumbnail: Buffer): Promise<ResponseObject>;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link remove}
    */
    public deleteEvent(targetGroupId: Number, eventId: Number): Promise<ResponseObject<EventGroupObject>>;
    public remove(targetGroupId: Number, eventId: Number): Promise<ResponseObject<EventGroupObject>>;
    public getById(eventId: Number, requestNew?: Boolean): Promise<EventGroupObject>;
    public getByIds(eventIds: Number|Array<Number>, requestNew?: Boolean): Promise<EventGroupObject | Array<EventGroupObject>>;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link getGroupEventList}
    */
    public getGroupEvents(targetGroupId: Number, requestNew?: Boolean): Promise<Array<EventGroupObject>>;
    public getGroupEventList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<EventGroupObject>>;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link getSubscriptionList}
    */
    public getEventSubscriptions(requestNew?: Boolean): Promise<Array<EventGroupObject>>;
    public getSubscriptionList(requestNew?: Boolean): Promise<Array<EventGroupObject>>;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link getGroupEventList}
    */
    public subscribeToEvent(eventId: Number): Promise<ResponseObject>;
    public subscribe(eventId: Number): Promise<ResponseObject>;
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link unsubscribe}
    */
     public unsubscribeFromEvent(eventId: Number): Promise<ResponseObject>;
     public unsubscribe(eventId: Number): Promise<ResponseObject>;              
}

export class Group extends BaseHelper {
    private constructor(api: WOLFBot);

    public list(): Promise<Array<GroupObject>>;
    public getById(targetGroupId: Number, requestNew?: Boolean): Promise<GroupObject>;
    public getByIds(targetGroupIds: Number |Array<Number>, requestNew?: Boolean) : Promise<Array<GroupObject>>;
    public getByName(targetGroupName: String, requestNew?: Boolean): Promise<GroupObject>;
    public joinById(targetGroupId: Number, password?: String): Promise<ResponseObject>;
    public joinByName(targetGroupName: String, password?: String): Promise<ResponseObject>
    public leaveById(targetGroupId: Number): Promise<ResponseObject>;
    public leaveByName(targetGroupName: String): Promise<ResponseObject>
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link getChatHistory}
    */
    public getHistory(targetGroupId: Number, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
    public getChatHistory(targetGroupId: Number, chronological: Boolean, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
    public getSubscriberList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupSubscriberObject>>;
    public getStats(targetGroupId: Number, requestNew?: Boolean): Promise<GroupStatsObject>
    public create(): GroupProfileBuilder;
    public update(group: GroupObject): GroupProfileBuilder;
    public updateAvatar(targetGroupId: Number, avatar: Buffer): Promise<ResponseObject>;
    public updateSubscriber(targetGroupId: Number, targetSubscriberId: Number, capabilities: Number): Promise<ResponseObject>
}

export class Messaging extends BaseHelper {
    private constructor(api : WOLFBot);

    public sendGroupMessage(targetGroupId: Number, content: Buffer | String, opts?: MessageOptionsObject): Promise<ResponseObject<MessageResponseObject>>;
    public sendPrivateMessage(sourceSubscriberId: Number, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageResponseObject>>;
    public sendMessage(commandOrMessage: CommandObject | MessageObject, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageResponseObject>>;
    public acceptPrivateMessageRequest(subscriberId :Number): Promise<ResponseObject<MessageResponseObject>>;
    public deleteGroupMessage(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageObject>>;
    public restoreGroupMessage(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageObject>>;
    public getGroupMessageEditHistory(targetGroupId: Number, timestamp: Number): Promise<ResponseObject<MessageEditObject>>;
    public subscribeToNextMessage(predict: any, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextGroupMessage(targetGroupId: Number, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextPrivateMessage(sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextGroupSubscriberMessage(targetGroupId: Number, sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
}

export class Notification extends BaseHelper {
    private constructor(api : WOLFBot);

    public list(language: Number, requestNew?: Boolean) : Promise<Array<NotificationObject>>;
    public clear(): Promise<ResponseObject>;
    public subscribe(language: Number): Promise<void>;
    public unsubscriber(language: Number): Promise<void>;
}


export class Phrase extends BaseHelper {
    private constructor(api : WOLFBot);

    public list(): Array<PhraseObject>;
    public count(): Promise<PhraseCountObject>;
    public clear(): Promise<void>;
    public load(phrases: Array<PhraseObject>): Promise<void>;
    public getLanguageList(): Promise<Array<String>>;
    public getAllByName(name: String): Array<PhraseObject>;
    public getByLanguageAndName(language: String, Name: string): String;
    public getByCommandAndName(command: CommandObject, Name: string): String;
    public isRequestedPhrase(name: string, value: string): Boolean;
}
export class Stage extends BaseHelper {
    private constructor(api : WOLFBot);

    public getSettings(targetGroupId: Number, requestNew?: Boolean): Promise<GroupAudioConfigObject>;
    public getStages(requestNew?: Boolean): Promise<Array<StageObject>>;
    public getStagesForGroup(targetGroupId: Number, requestNew?: Boolean): Promise<Array<StageGroupObject>>;
    public getSlots(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupAudioSlotObject>>;
    public updateSlotMuteState(targetGroupId: Number, slotId: Number, muted: Boolean): Promise<ResponseObject>;
    public updateSlotLockState(targetGroupId: Number, slotId: Number, locked: Boolean): Promise<ResponseObject>;
    public leaveSlot(targetGroupId: Number): Promise<ResponseObject>;
    public removeSubscriberFromSlot(targetGroupId: Number, slotId: Number): Promise<ResponseObject>;
    public joinSlot(targetGroupId :Number, slotId: Number, sdp?:String): Promise<ResponseObject>;
    public consumeSlot(targetGroupId :Number, slotId: Number, sdp: String): Promise<ResponseObject>;
    public play(targetGroupId: Number, data: Readable): void;
    public pause(targetGroupId: Number): Promise<StageClientUpdatedObject>;
    public resume(targetGroupId: Number): Promise<StageClientUpdatedObject>;
    public stop(targetGroupId: Number): Promise<StageClientUpdatedObject>;
    public isReady(targetGroupId: Number): Promise<Boolean>;
    public isPaused(targetGroupId: Number): Promise<Boolean>;
    public isPlaying(targetGroupId: Number): Promise<Boolean>;
    public isConnecting(targetGroupId: Number): Promise<Boolean>;
    public isConnected(targetGroupId: Number): Promise<Boolean>;
    public duration(targetGroupId: Number): Promise<Number>;
    public hasClient(targetGroupId: Number): Promise<Boolean>;
    public slotId(targetGroupId: Number): Promise<Number>;
}
export class Store extends BaseHelper {
    private constructor(api : WOLFBot);

    public getBalance(requestNew?: Boolean) : Number;
}

export class Subscriber extends BaseHelper {
    private constructor(api : WOLFBot);

    public getById(subscriberId: Number, requestNew?: Boolean): Promise<SubscriberObject>;
    public getByIds(targetGroupIds: Number |Array<Number>, requestNew?: Boolean) : Promise<Array<SubscriberObject>>; 
    /**
    * @deprecated Will be removed in 1.0.0
    * @use {@link getChatHistory}
    */
    public getHistory(subscriberId: Number, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
    public getChatHistory(subscriberId: Number, chronological: Boolean, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
}

export class Tipping extends BaseHelper {
    private constructor(api : WOLFBot);
    
    public tip(subscriberId: Number, targetGroupId: Number, context: TipContextObject, charms: Array<TipCharmObject>): Promise<ResponseObject>;
    public getDetails(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<{id: Number, charmList: TipCharmObject, version: Number}>;
    public getSummary(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number):Promise<{id: Number, list: TipCharmObject, version: Number}>;
    public getGroupLeaderboard(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<TipLeaderboardObject>
    public getGroupLeaderboardSummary(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<TipLeaderboardSumamryObject>
    public getGlobalLeaderboard (tipPeriod: String, tipType: String, tipDirection?: String): Promise<TipLeaderboardObject>
    public getGlobalLeaderboardSummary(tipPeriod: String): Promise<TipLeaderboardSumamryObject>
}

//#endregion

//#region interfaces - Borrowed from Discord.JS setup - https://github.com/discordjs/discord.js
// https://github.com/discordjs/discord.js/blob/main/typings/index.d.ts
export interface ClientEvents {
    connected: [void],
    connecting: [void],
    connectionError: [error: object],
    connectionTimeOut: [error: object],
    disconnected: [reason: String],
    groupAudioCountUpdate: [old: GroupAudioCountObject, new: GroupAudioCountObject],
    groupAudioSlotUpdate: [old: GroupAudioSlotObject, new: GroupAudioSlotObject],
    groupAudioUpdate: [old: GroupAudioConfigObject, new: GroupAudioConfigObject],
    groupEventCreate: [event: EventGroupObject],
    groupEventUpdate: [old: EventGroupObject, new: EventGroupObject],
    groupMemberAdd: [group: GroupObject, subscriber: SubscriberObject],
    groupMemberDelete:[group: GroupObject, subscriber: SubscriberObject],
    groupMessage: [message: MessageObject],
    groupMessageUpdate: [message: MessageObject],
    groupTipAdd: [tip: object],
    groupUpdate: [old: GroupObject, new: GroupObject],
    internalError: [],
    joinedGroup: [group: GroupObject],
    leftGroup: [group: GroupObject],
    log: [log: string],
    loginFailed: [response: ResponseObject],
    loginSuccess: [subscriber: SubscriberObject],
    notificationReceived:[notification: NotificationObject],
    packetRecieved: [command: string, body: object],
    packetSent: [command: string, body: object],
    ping: [void],
    pong: [latency: number],
    presenceUpdate: [old: PresenceObject, new: PresenceObject],
    privateMessage: [message: MessageObject],
    privateMessageAcceptResponse: [message: MessageObject],
    privateMessageUpdate: [message: MessageObject],
    privateTipAdd: [tip: object],
    ready: [void],
    reconnected: [void],
    reconnecting: [attempt: Number]
    reconnectFailed: [error: object],
    stageClientBroadcastEnd: [change: StageClientUpdatedObject],
    stageClientConnected: [change: StageClientUpdatedObject],
    stageClietnConnecting: [change: StageClientUpdatedObject],
    stageClientDisconnected: [change: StageClientUpdatedObject],
    stageClientDuration: [change: StageClientUpdatedObject],
    stageClientError: [change: StageClientUpdatedObject],
    stageClientKicked: [change: StageClientUpdatedObject],
    stageClientMuted: [change: StageClientUpdatedObject],
    stageClientPaused: [change: StageClientUpdatedObject],
    stageClientReady: [change: StageClientUpdatedObject],
    stageClientStopped: [change: StageClientUpdatedObject],
    stageClientUnmuted: [change: StageClientUpdatedObject],
    stageClientUnpaused: [change: StageClientUpdatedObject],
    stageClientViewerCountChanged: [change: StageClientUpdatedObject],
    subscriberBlockAdd: [subscriber: SubscriberObject],
    subscriberBlockDelete: [subscriber: SubscriberObject],
    subscriberContactAdd: [subscriber: SubscriberObject],
    subscriberContactDelete: [subscriber: SubscriberObject],
    subscriberGroupEventAdd: [event: EventGroupObject],
    subscriberGroupEventDelete: [event: EventGroupObject],
    subscriberUpdate: [old: SubscriberObject, new: SubscriberObject],
    welcome: [welcome: WelcomeObject],
  }

  //#endregion
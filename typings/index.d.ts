/**
 * V0.17.0 & above Typings Support
 * First attempt at typings support
 * This file is a mess, this is more or less for experimental purposes
 * This file will be redone in a future update
 */

import type { Readable } from "stream";

export class Websocket {
    private constructor(api: WOLFBot);
    public create(): undefined;
    public emit(command: String, data: Object): Promise<Object>;
}
export class NetworkSettingsObject {
    public retryMode: Number;
    public retryAttempts: Number;
}
export class CommandSettingsObject {
    public ignoreOfficialBots: Boolean;
    public ignoreUnofficialBots: Boolean;
}
export class AppObject {
    public developerId: Number;
    public defaultLanguage: String;
    public commandSettings: CommandSettingsObject;
    public networkSettings: NetworkSettingsObject;
}
export class ConfigurationObject {
    public keyword: String;
    public app: AppObject;
}
export class OptionsObject {
    public keyword: String;
    public ignoreOfficialBots: Boolean;
    public ignoreUnofficialBots: Boolean;
    public developerId: Number;
    public networking: NetworkSettingsObject;
}
export class ResponseObject<T = undefined> {
    public code: Number;
    public body: T;
    /**
     * example { "message":"this is a message"}
     */
    public headers: { [key: string]: String };
    public success: Boolean
}
export class MessageMetadatObject{
        formatting: {
            groupLinks: Array<{start: Number, stop: Number; groupId: Number}>;
            links: Array<{start: Number; end: Number; url: String}>
        };
        isDeleted: Boolean;
        isSpam: Boolean;
    
}
export class MessageObject{
    public body: String;
    public edited: {subscriberId: Number, timestamp: Number};
    public embeds: Array<{type: String, groupId: Number, url: String, title: String, image: Buffer, body: String}>;
    public id: String;
    public isGroup: Boolean;
    public metadata :MessageMetadatObject;
    public targetGroupId: Number;
    public sourceSubscriberId: Number;
    public timestamp: Number;
    public type: String;
    public isCommand: Boolean;
}
export class SubscriberObject{
    private constructor();
    public exists: Boolean;
    public charms: { selectedList: Array<SelectedCharmObject> };
    public deviceType: Number;
    public extended : {  about: String;   gender: Number;   language: Number; lookingFor: Number;  name: String; relationship: Number; urls: Array<String>; utcOffset: Number;};
    public hash: String;
    public icon: Number;
    public id: Number;
    public nickname: String;
    public onlineState: Number;
    public privileges: Number;
    public reputation: Number;
    public status: String;
}
export class IdHashObject{
    public id: Number;
    public hash: String;
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
    public details : {
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
export class GroupSubscriberObject{
    public id: Number;
    public groupId: Number;
    public additionalInfo: { hash: String; nickname: String; privileges: Number;  onlineState: Number;};
    public capabilities: Number;
}
export class AudioConfigObject{
    public id: Number;
    public enabled: Boolean;
    public minRepLevel: Number;
    public stageId: Number;
    public sourceSubscriberId: Number;
}
export class AudioCountObject{
    public id: Number;
    public consumerCount: Number;
    public broadcasterCount: Number;
}
export class GroupObject{
    private constructor();
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
    public extended: { discoverable: Boolean; advancedAdmin: Boolean; locked: Boolean;questionable: Boolean;entryLevel: Number;passworded: Boolean; language: Number; longDescription: String; id: Number;};
    public audioConfig: AudioConfigObject;
    public audioCount: AudioCountObject;
    public inGroup: Boolean;
    public capabilities: Number;
}

export class StoreBalanceObject{
    public balance: Number;
}
export class CognitoTokenObject {
    public identity: String;
    public token: String;
}
export class WOLFBot {
    public constructor();
    public websocket: Websocket;
    public commandHandler(): CommandHandler;
    public on : EventManager;
    public config: ConfigurationObject;
    public options: OptionsObject;
    public achievement(): AchievementHelper;
    public authorization(): AuthorizationHelper;
    public banned(): BannedHelper;
    public blocked(): BlockedHelper;
    public charm(): CharmHelper;
    public contact(): ContactHelper;
    public discovery(): DiscoveryHelper;
    public event(): EventHelper; 
    public group(): GroupHelper;
    public messaging(): MessagingHelper;
    public notification(): NotificationHelper;
    public phrase(): PhraseHelper;
    public stage(): StageHelper;
    public subscriber(): SubscriberHelper;
    public tip(): TipHelper;
    public utility(): Utility;
    public currentSubscriber: SubscriberObject;
    public login(email: String, password: String, loginDevice?: String, onlineState?: Number, loginType?: String, token?: String): void;
    public logout(): Promise<ResponseObject>;
    public setOnlineState(onlineState: Number): Promise<ResponseObject>;
    public search(query: String): Promise<Array<{type: String, id: Number, hash: String, reason: String}>>;
    public getConverstaionList(timestamp?: Number): Promise<Array<Object>>;
    public setSelectedCharms(charms: SelectedCharmObject | Array<SelectedCharmObject>): Promise<ResponseObject>;
    public deleteCharms(charmIds: Number | Array<Number>): Promise<ResponseObject>;
    public setMessageSetting(messageFilterTier: Number): Promise<ResponseObject>;
    public updateAvatar(avatar: Buffer): Promise<ResponseObject>;
    public getCreditBalance(): Promise<StoreBalanceObject>;
    public updateProfile(): SubscriberProfileBuilder;
    public getSecurityToken(requestNew?: Boolean): Promise<CognitoTokenObject>;
    public getLinkMetadata(link: String): Promise<{description: String, domain: String, imageSize: String, imageUrl: String, isOfficial: Boolean, title: String}>;
    public getLinkBlacklist(requestNew?: Boolean): Promise<Array<{id: Number, regex: String}>>;
}
export class EventManager {
    public connected(fn: Function): void;
    public connecting(fn: Function): void;
    public connectionError(fn: Function): void;
    public disconnected(fn: Function): void;
    public error(fn: Function): void;
    public log(fn: Function): void;
    public loginFailed(fn: Function): void;
    public loginSuccess(fn: Function): void;
    public packetReceived(fn: Function): void;
    public packetSent(fn: Function): void;
    public ping(fn: Function): void;
    public pong(fn: Function): void;
    public ready(fn: Function): void;
    public reconnectFailed(fn: Function): void;
    public reconnected(fn: Function): void;
    public reconnecting(fn: Function): void;
    public welcome(fn: Function): void;
    public contactAdded(fn: Function): void;
    public contactRemoved(fn: Function): void;
    public presenceUpdate(fn: Function): void;
    public privateMessageRequestAccepted(fn: Function): void;
    public subscriberBlocked(fn: Function): void;
    public subscriberGroupEventAdded(fn: Function): void;
    public subscriberGroupEventDeleted(fn: Function): void;
    public subscriberUnblocked(fn: Function): void;
    public subscriberUpdate(fn: Function): void;
    public groupAudioCountUpdate(fn: Function): void;
    public groupAudioSlotUpdate(fn: Function): void;
    public groupAudioUpdate(fn: Function): void;
    public groupEventCreated(fn: Function): void;
    public groupEventUpdate(fn: Function): void;
    public groupSubscriberUpdate(fn: Function): void;
    public groupUpdate(fn: Function): void;
    public joinedGroup(fn: Function): void;
    public leftGroup(fn: Function): void;
    public subscriberJoined(fn: Function): void;
    public subscriberLeft(fn: Function): void;
    public groupMessage(fn: Function): void;
    public privateMessage(fn: Function): void;
/**
 * @param {Function(MessageObject)} fn
 */
    public messageUpdate(fn: Function): void;
    public tipped(fn: Function): void;
    public stageClientBroadcastEnded(fn: Function): void;
    public stageClientConnecting(fn: Function): void;
    public stageClientConnected(fn: Function): void;
    public stageClientDisconnected(fn: Function): void;
    public stageClientDurationUpdate(fn: Function): void;
    public stageClientError(fn: Function): void;
    public stageClientKicked(fn: Function): void;
    public stageClientMuted(fn: Function): void;
    public stageClientPaused(fn: Function): void;
    public stageClientReady(fn: Function): void;
    public stageClientStopped(fn: Function): void;
    public stageClientUnmuted(fn: Function): void;
    public stageClientMuted(fn: Function): void;
    public stageClientUnpaused(fn: Function): void;
    public stageClientViewerCountUpdate(fn: Function): void;
    public permissionFailed(fn: Function): void;
    public notification(fn: Function): void;
}

export class CommandObject{
    public isGroup: Boolean;
    public language: String;
    public argument: String;
    public message: MessageObject;
    public targetGroupId: Number;
    public sourceSubscriberId: Number;
    public timestamp: Number;
    public type: String;
}
export class Command{
    constructor(trigger: string, commandCallbacks: object, children: Array<Command>);
}
export class CommandHandler{
    private constructor(api: WOLFBot);
    public isCommand(message: MessageObject): Boolean;
    public register(commands: Array<Command>): void;
}
export abstract class Helper {
    public constructor(api: WOLFBot);
    private _clearCache();
}
export class AchievementUnlockedObject{
    public id: Number;
    public additionalInfo: {
        eTag: String,  
        awardedAt: Date,  
        categoryId: Number 
    }
}
export class SubscriberAchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public getById(targetGroupId: Number): Promise<Array<AchievementUnlockedObject>>;
}
export class GroupAchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public getById(targetGroupId: Number): Promise<Array<AchievementUnlockedObject>>;
}
export class AchievementCategory{
    public id: Number;
    public name: String;
}
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
export class AchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public group(): GroupAchievementHelper;
    public subscriber(): SubscriberAchievementHelper;
    public getCategoryList(language:Number, requestNew?: Boolean): Promise<Array<AchievementCategory>>;
    public getByIds(achievementIds: Array<Number>, language: Number, requestNew?: Boolean): Promise<Array<AchievementObject>>
}
export class AuthorizationHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Array<Number>;
    public isAuthorized(subscriberId: Number): Boolean;
    public clear(): void;
    public authorize(subscriberIds : Number | Array<Number>): void;
    public unauthorize(subscriberIds : Number | Array<Number>): void;
}
export class BannedHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Array<Number>;
    public isBanned(subscriberId: Number): Boolean;
    public clear(): void;
    public ban(subscriberIds : Number | Array<Number>): void;
    public unban(subscriberIds : Number | Array<Number>): void;
}
export class BlockedHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Promise<Array<GroupSubscriberObject>>;
    public isBanned(subscriberId: Number): Promise<Boolean>;
    public block(subscriberId : Number): Promise<ResponseObject>;
    public unblock(subscriberId : Number): Promise<ResponseObject>;
}

export class SelectedCharmObject{
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

export class SubscriberCharmObject {
    public charmId: Number;
    public expireTime: Date;
    public id: Number;
    public sourceSubscriberId: Number;
    public subscriberId: Number;
}
export class SubscriberCharmStatisticsObject {
    public subscriberId: Number;
    public totalActive: Number;
    public totalExpired: Number;
    public totalGiftedRecieved: Number;
    public totalGiftedSent: Number;
    public totalLifeTime: Number;
}
export class SubscriberCharmSummaryObject{
    public charmId: Number;
    public expireTime: Date;
    public giftCount: Number;
    public total: Number;
}
export class CharmHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Promise<Array<CharmObject>>;
    public getById(charmId: Number, language: Number, requestNew?:Boolean): Promise<CharmObject>;
    public getByIds(charmIds: Array<Number>, language: Number, requestNew?:Boolean): Promise<Array<CharmObject>>;
    public getSubscriberStatistics(subscriberId: Number): Promise<ResponseObject<SubscriberCharmStatisticsObject>>;
    public getSubscriberActiveList(subscriberId: Number, limit?: Number, offset?: Number): Promise<ResponseObject<Array<SubscriberCharmObject>>>;
    public getSubscriberExpiredList(subscriberId: Number, limit?: Number, offset?: Number): Promise<ResponseObject<Array<SubscriberCharmObject>>>;
    public getSubscriberSummary(subscriberId: Number): Promise<ResponseObject<SubscriberCharmSummaryObject>>;
}
export class ContactHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Promise<Array<GroupSubscriberObject>>;
    public isContact(subscriberId: Number): Promise<Boolean>;
    public add(subscriberId : Number): Promise<ResponseObject>;
    public delete(subscriberId : Number): Promise<ResponseObject>;
}
export class DiscoveryRecipeObject{
    public type: String;
    public idList: Number;
}
export class DiscoverySectionElementObject{
    public onInvalid: String;
    public aspect: {
        width: Number;
        height: Number,
    };
    public link: {
        url: String,
        text: String,
    }
    public autoplay: Boolean;
    public muted: Boolean;
    public loop: Boolean;
    public context: String;
    public url: String;
    public recipe: {
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
    public validity :{
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

export class DiscoveryHelper extends Helper {
    private constructor(api : WOLFBot);
    public getByLanguage(language: Number, requestNew?: boolean): Promise<DiscoveryObject>;
    public getRecipe(id: Number, language: Number, requestNew?: boolean): Promise<DiscoveryRecipeObject>;
    public getRecipeBySectionId(id: Number, language: Number, requestNew?: boolean): Promise<DiscoverySectionObject>;
}
export class EventGroupObject {
    public id: Number;
    public additionalInfo :{
        eTag: String;
        startsAt: Date;
        endsAt: Date
    }
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
export class EventHelper extends Helper {
    private constructor(api : WOLFBot);
    public getGroupEvents(targetGroupId: Number, requestNew?: Boolean): Promise<Array<EventGroupObject>>;
    public getByIds(evnetIds: Number | Array<Number>, requestNew?: Boolean): Promise<Array<EventObject>>;
    public createEvent(targetGroupId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, thumbnail?: Buffer): Promise<ResponseObject<GroupObject>>;
    public updateEvent(targetGroupId: Number, eventId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, imageUrl?: String, thumbnail?: Buffer): Promise<ResponseObject<GroupObject>>;
    public updateEventThumbnail(eventId: Number, thumbnail: Buffer): Promise<ResponseObject>;
    public deleteEvent(targetGroupId: Number, eventId: Number) : Promise<ResponseObject<EventGroupObject>>;
    public subscribeToEvent(eventId: Number): Promise<ResponseObject<EventGroupObject>>;
    public unsubscribeFromEvent(eventId: Number): Promise<ResponseObject>;
    public getEventSubscriptions(requestNew?: Boolean): Promise<Array<Object>>;
}
export class GroupProfileBuilder {
    private constructor(api: WOLFBot);
    private _create();
    private _update(group: GroupObject);
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
export class GroupHelper extends Helper {
    private constructor(api : WOLFBot);
    public list() : Promise<Array<GroupObject>>;
    public create(): GroupProfileBuilder;
    public getByIds(targetGroupIds: Number| Array<Number>, requestNew?: Boolean): Promise<Array<GroupObject>>;
    public getById(targetGroupId: Number, requestNew?: Boolean): Promise<GroupObject>;
    public joinById(targetGroupId: Number, password?: String): Promise<ResponseObject>;
    public joinByName(name: String, password?: String): Promise<ResponseObject>;
    public leaveById(targetGroupId: Number): Promise<ResponseObject>;
    public leaveByName(name: String): Promise<ResponseObject>;
    public getHistory(targetGroupId: Number, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
    public getSubscriberList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupSubscriberObject>>;
    public getStats(targetGroupId: Number): Promise<ResponseObject<GroupStatsObject>>;
    public updateAvatar(targetGroupId: Number, avatar: Buffer) : Promise<ResponseObject>;
    public updateSubscriber(targetGroupId: Number, subscriberId: Number, capability: Number): Promise<ResponseObject>;  
}
export class MessageOptionsObject{
    public chunk: Boolean;
    public chunkSize: Number;
    public includeEmbeds: Boolean;
}
export class MessageEditObject{
    public data: String;
    public metadata: MessageMetadatObject;
    public subscriberId: Number;
    public timestamp: Number;
}
export class MessageSendResponseObject{
    public timestamp: Number;
    public uuid: String;
}
export class MessagingHelper extends Helper {
    private constructor(api : WOLFBot);
    public sendGroupMessage(targetGroupId: Number, content: Buffer | String, opts?: MessageOptionsObject): Promise<ResponseObject<MessageSendResponseObject>>;
    public sendPrivateMessage(sourceSubscriberId: Number, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageSendResponseObject>>;
    public sendMessage(commandOrMessage: CommandObject | MessageObject, content: Buffer | String, opts?: MessageOptionsObject):  Promise<ResponseObject<MessageSendResponseObject>>;
    public acceptPrivateMessageRequest(subscriberId :Number): Promise<ResponseObject<MessageSendResponseObject>>;
    public deleteGroupMessage(targetGroupId: Number, timestamp: Number): Promise<MessageObject>;
    public restoreGroupMessage(targetGroupId: Number, timestamp: Number): Promise<MessageObject>;
    public getGroupMessageEditHistory(targetGroupId: Number, timestamp: Number): Promise<MessageEditObject>;
    public subscribeToNextMessage(predict: any, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextGroupMessage(targetGroupId: Number, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextPrivateMessage(sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
    public subscribeToNextGroupSubscriberMessage(targetGroupId: Number, sourceSubscriberId: Number, timeout?: Number ) : Promise<MessageObject>;
}
export class NotificationObject {
    public actions: Array<{
        id: Number,
        titleText: String;
        actionUrl: String;
        external: Boolean;
        imageUrl: String
    }>;
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
export class NotificationHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(language: Number, requestNew?: Boolean) : Promise<Array<NotificationObject>>;
    public clear(): Promise<ResponseObject>;
    public subscribe(language: Number): Promise<ResponseObject>;
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
export class PhraseHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(includeLocal: Boolean): Array<PhraseObject>;
    public count(): PhraseCountObject;
    public clear(): void;
    public load(phrases: Array<PhraseObject>): void;
    public getLanguageList(): Array<String>;
    public getAllByName(name: String): Array<PhraseObject>;
    public getByLanguageAndName(language: String, Name: string): String;
    public getByCommandAndName(command: CommandObject, Name: string): String;
    public isRequestedPhrase(name: string, value: string): Boolean;
}
export class StageClientResponseObject{
    public slotId: Number;
    public duration: Number;
    public sourceSubscriberId: Number;
}
export class SlotObject{
    public id: Number;
    public locked: Number;
    public occupierId: Number|null;
    public occupierMuted: Boolean;
    public uuid: String;
    public connectionState: String;
    public reservedExpiresAt: Date;
    public reservedOccupierId: Number|null;
}
export class GroupStageObject{
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
export class StageHelper extends Helper {
    private constructor(api : WOLFBot);
    public getSettings(targetGroupId: Number, requestNew?: Boolean): Promise<AudioConfigObject>;
    public getStages(requestNew?: Boolean): Promise<Array<StageObject>>;
    public getStagesForGroup(targetGroupId: Number, requestNew?: Boolean): Promise<Array<GroupStageObject>>;
    public getSlots(targetGroupId: Number, requestNew?: Boolean): Promise<Array<SlotObject>>;
    public updateSlotMuteState(targetGroupId: Number, slotId: Number, muted: Boolean): Promise<ResponseObject>;
    public updateSlotLockState(targetGroupId: Number, slotId: Number, locked: Boolean): Promise<ResponseObject>;
    public leaveSlot(targetGroupId: Number): Promise<ResponseObject>;
    public removeSubscriberFromSlot(targetGroupId: Number, slotId: Number): Promise<ResponseObject>;
    public joinSlot(targetGroupId :Number, slotId: Number, sdp?:String): Promise<ResponseObject>;
    public consumeSlot(targetGroupId :Number, slotId: Number, sdp: String): Promise<ResponseObject>;
    public play(targetGroupId: Number, data: Readable): void;
    public pause(targetGroupId: Number): Promise<StageClientResponseObject>;
    public resume(targetGroupId: Number): Promise<StageClientResponseObject>;
    public stop(targetGroupId: Number): Promise<StageClientResponseObject>;
    public isReady(targetGroupId: Number): Promise<Boolean>;
    public isPaused(targetGroupId: Number): Promise<Boolean>;
    public isPlaying(targetGroupId: Number): Promise<Boolean>;
    public isConnecting(targetGroupId: Number): Promise<Boolean>;
    public isConnected(targetGroupId: Number): Promise<Boolean>;
    public duration(targetGroupId: Number): Promise<Number>;
    public hasClient(targetGroupId: Number): Promise<Boolean>;
    public slotId(targetGroupId: Number): Promise<Number>;
}
export class SubscriberProfileBuilder {
    private constructor(api: WOLFBot, subscriber: SubscriberObject);
    public setNickname(nickname: String): SubscriberProfileBuilder;
    public setAbout(about: String) : SubscriberProfileBuilder;
    public setName(name: String): SubscriberProfileBuilder;
    public setStatus(status: String) : SubscriberProfileBuilder;
    public setLanguage(language: Number): SubscriberProfileBuilder;
    public setRelationship(relationship: Number): SubscriberProfileBuilder;
    public setGender(gener: Number): SubscriberProfileBuilder;
    public setLookingFor(lookingFor: Number): SubscriberProfileBuilder;
    public setUrls(urls: Array<String>): SubscriberProfileBuilder;
    public addUrl(url: String): SubscriberProfileBuilder;
    public removeUrl(url: string): SubscriberProfileBuilder;
    public save(): Promise<ResponseObject>;
}
export class SubscriberHelper extends Helper {
    private constructor(api : WOLFBot);
    public getByIds(sourceSubscriberIds: Number| Array<Number>, requestNew?: Boolean): Promise<Array<SubscriberObject>>;
    public getById(sourceSubscriberId: Number, requestNew?: Boolean): Promise<SubscriberObject>;
    public getHistory(sourceSubscriberId: Number, timestamp?: Number, limit?: Number): Promise<Array<MessageObject>>;
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
export class TipHelper extends Helper {
    private constructor(api : WOLFBot);
    public tip(subscriberId: Number, targetGroupId: Number, context: TipContextObject, charms: Array<TipCharmObject>): Promise<ResponseObject>;
    public getDetails(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<{id: Number, charmList: TipCharmObject, version: Number}>;
    public getSummary(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number):Promise<{id: Number, list: TipCharmObject, version: Number}>;
    public getGroupLeaderboard(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<TipLeaderboardObject>
    public getGroupLeaderboardSummary(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<TipLeaderboardSumamryObject>
    public getGlobalLeaderboard (tipPeriod: String, tipType: String, tipDirection?: String): Promise<TipLeaderboardObject>
    public getGlobalLeaderboardSummary(tipPeriod: String): Promise<TipLeaderboardSumamryObject>
}
export class AchievementUtility{
    private constructor(api: WOLFBot);
    public mapToCategories(achievements: Array<Object>, language: Number): Promise<Array<Object>>;
}
export class ArrayUtility{
    private constructor(api: WOLFBot);
    public chunk(array: Array<any>, length: Number): Array<Array<any>>
}
export class DiscoveryUtility {
    private constructor(api: WOLFBot);
    public getRecipeSections(language: Number, requestNew?: boolean): Array<DiscoverySectionObject>;
}
export class DownloadUtility {
    private constructor(api: WOLFBot);
    public file(url: string): Promise<Buffer>;
}
export class MemberUtility {
    private constructor(api: WOLFBot);
    public get(targetGroupId: Number, sourceSubscriberId: Number): GroupSubscriberObject;
    public checkPermissions(targetGroupId: Number, sourceSubscriberId: Number, requiredCapability: Number, checkStaff?: Boolean, includeAuthorizedSubscribers?: Number): Promise<Boolean>; 
}
export class GroupUtility{
    private constructor(api: WOLFBot);
    public member(): MemberUtility;
    public getAvatar(subscriberId: Number, size: Number): Promise<Buffer>;
    public toDisplayName(group: GroupObject, excludeId?: Boolean): String;
}
export class NumberUtility {
    private constructor(api: WOLFBot);
    public toEnglishNumbers(arg: String|Number): Number | String;
    public toArabicNumbers(arg: String|Number): Number| String;
    public toPersianNumbers(arg: String |Number): Number | String;
    public addCommas(arg: Number | String) : Number | String;
}
export class StringUtility{
    private constructor(api: WOLFBot);
    /**
     * @param replacements - Example: { nickname: 'Martin', subscriberId: 1 }
     */
    public replace(string: String, replacements: { [key: string]: String|Number}): String;
    public isEqual(sideA: String, sideB: String): Boolean;
    public chunk(string: String, max?: Number, splitChar?: String, joinChar?: String): Array<String>;
    public trimAds(string: String): String;
    public isValudUrl(url: String): Boolean;
}
export class PrivilegeUtility{
    private constructor(api: WOLFBot);
    public has(sourceSubscriberId: Number, privs: Array<Number>|Number, requiresAll?: Boolean): Promise<Boolean>
}
export class SubscriberUtility {
    private constructor(api: WOLFBot);
    public privilege(): PrivilegeUtility;
    public getAvatar(subscriberId: Number, size: Number): Promise<Buffer>;
    public toDisplayName(subscriber: SubscriberObject, trimAds?: Boolean, excludeId?: Boolean): String;
    public hasCharms(subscriberId: Number, charmIds: Array<Number>, requiresAll?: Boolean): Promise<Boolean>
}
export class TimerUtility{
    private constructor(api: WOLFBot);
    public initialise(handlers: Object, ...args: any): Promise<any>;
    public add(name: String, handler: String, data: Object, duration: Number): Promise<Object>
    public cancel(name: String): Promise<any>;
    public get(name: String): Promise<Object>;
    public delay(name: String, duration: Number): Promise<Object>
}
export class Utility {
    private constructor(api : WOLFBot);
    public achivement(): AchievementUtility;
    public array(): ArrayUtility;
    public discovery(): DiscoveryUtility;
    public download(): DownloadUtility;
    public group(): GroupUtility;
    public number(): NumberUtility;
    public string(): StringUtility;
    public subscriber(): SubscriberUtility;
    public timer(): TimerUtility;
    public toReadableTime(language: String, milliseconds: Number): String;
    public delay(duration: Number): void;
}
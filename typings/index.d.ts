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
export class Configuration {
    public keyword: String;
    public app: AppObject;
}
export class Options {
    public keyword: String;
    public ignoreOfficialBots: Boolean;
    public ignoreUnofficialBots: Boolean;
    public developerId: Number;
    public networking: NetworkSettingsObject;
}

export class Response<T = undefined> {
    public code: Number;
    public body: T;
    public headers: Object;
    public success: Boolean
}

export class WOLFBot {
    public constructor();
    public websocket: Websocket;
    public commandHandler(): CommandHandler;
    public on : EventManager;
    public config: Configuration;
    public options: Options;
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
    public currentSubscriber: Object;
    public login(email: String, password: String, loginDevice?: String, onlineState?: Number, loginType?: String, token?: String): void;
    public logout(): Promise<Response>;
    public setOnlineState(onlineState: Number): Promise<Object>;
    public search(query: String): Promise<Object>;
    public getConverstaionList(timestamp?: Number): Promise<Array<Object>>;
    public setSelectedCharms(charms: Object | Array<Object>): Promise<Object>;
    public deleteCharms(charmIds: Number | Array<Number>): Promise<Object>;
    public setMessageSetting(messageFilterTier: Number): Promise<Object>;
    public updateAvatar(avatar: Buffer): Promise<Object>;
    public getCreditBalance(): Promise<Object>;
    public updateProfile(): SubscriberProfileBuilder;
    public getSecurityToken(requestNew?: Boolean): Promise<Object>;
    public getLinkMetadata(link: String): Promise<Object>;
    public getLinkBlacklist(requestNew?: Boolean): Promise<Array<Object>>;
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
export class Command{
    constructor(trigger: string, commandCallbacks: object, children: Array<Command>);
}
export class CommandHandler{
    private constructor(api: WOLFBot);
    public isCommand(message: Object): Boolean;
    public register(commands: Array<Command>): void;
}
export abstract class Helper {
    public constructor(api: WOLFBot);
    private _clearCache();
}
export class SubscriberAchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public getById(targetGroupId: Number): Promise<Object>
}
export class GroupAchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public getById(targetGroupId: Number): Promise<Object>
}
export class AchievementHelper extends Helper {
    private constructor(api : WOLFBot);
    public group(): GroupAchievementHelper;
    public subscriber(): SubscriberAchievementHelper;
    public getCategoryList(language:Number, requestNew?: Boolean): Array<Object>
    public getByIds(achievementIds: Array<Number>, language: Number, requestNew?: Boolean): Promise<Object>
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
    public list(): Promise<Array<Object>>;
    public isBanned(subscriberId: Number): Promise<Boolean>;
    public block(subscriberId : Number): Promise<Object>;
    public unblock(subscriberId : Number): Promise<Object>;
}
export class CharmHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Promise<Array<Object>>;
    public getById(charmId: Number, language: Number, requestNew?:Boolean): Promise<Object>;
    public getByIds(charmIds: Array<Number>, language: Number, requestNew?:Boolean): Promise<Array<Object>>;
    public getSubscriberStatistics(subscriberId: Number): Promise<Object>;
    public getSubscriberActiveList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<Object>>;
    public getSubscriberExpiredList(subscriberId: Number, limit?: Number, offset?: Number): Promise<Array<Object>>;
    public getSubscriberSummary(subscriberId: Number): Promise<Object>;
}
export class ContactHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(): Promise<Array<Object>>;
    public isContact(subscriberId: Number): Promise<Boolean>;
    public add(subscriberId : Number): Promise<Object>;
    public delete(subscriberId : Number): Promise<Object>;
}
export class DiscoveryHelper extends Helper {
    private constructor(api : WOLFBot);
    public getByLanguage(language: Number, requestNew?: boolean): Promise<Object>;
    public getRecipe(id: Number, language: Number, requestNew?: boolean): Promise<Object>;
    public getRecipeBySectionId(id: Number, language: Number, requestNew?: boolean): Promise<Object>;
}
export class EventHelper extends Helper {
    private constructor(api : WOLFBot);
    public getGroupEvents(targetGroupId: Number, requestNew?: Boolean): Promise<Object>;
    public getByIds(evnetIds: Number | Array<Number>, requestNew?: Boolean): Promise<Array<Object>>;
    public createEvent(targetGroupId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, thumbnail?: Buffer): Promise<Object>;
    public updateEvent(targetGroupId: Number, eventId: Number, title: String, startsAt: Date, endsAt: Date, shortDescription?: String, longDescription?: String, imageUrl?: String, thumbnail?: Buffer): Promise<Object>;
    public updateEventThumbnail(eventId: Number, thumbnail: Buffer): Promise<Object>;
    public deleteEvent(targetGroupId: Number, eventId: Number) : Promise<Object>;
    public subscribeToEvent(eventId: Number): Promise<Object>;
    public unsubscribeFromEvent(eventId: Number): Promise<Object>;
    public getEventSubscriptions(requestNew?: Boolean): Promise<Array<Object>>;
}
export class GroupProfileBuilder {
    private constructor(api: WOLFBot);
    private _create();
    private _update(group: Object);
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
    public create() : Promise<Object>;
    public save(): Promise<Object>;
}
export class GroupHelper extends Helper {
    private constructor(api : WOLFBot);
    public list() : Array<Object>;
    public create(): GroupProfileBuilder;
    public getByIds(targetGroupIds: Number| Array<Number>, requestNew?: Boolean): Promise<Array<Object>>;
    public getById(targetGroupId: Number, requestNew?: Boolean): Promise<Object>;
    public joinById(targetGroupId: Number, password?: String): Promise<Object>;
    public joinByName(name: String, password?: String): Promise<Object>;
    public leaveById(targetGroupId: Number): Promise<Object>;
    public leaveByName(name: String): Promise<Object>;
    public getHistory(targetGroupId: Number, timestamp?: Number, limit?: Number): Promise<Array<Object>>;
    public getSubscriberList(targetGroupId: Number, requestNew?: Boolean): Promise<Array<Object>>;
    public getStats(targetGroupId: Number): Promise<Object>;
    public updateAvatar(targetGroupId: Number, avatar: Buffer) : Promise<Object>;
    public updateSubscriber(targetGroupId: Number, subscriberId: Number, capability: Number): Promise<Object>;  
}
export class MessagingHelper extends Helper {
    private constructor(api : WOLFBot);
    public sendGroupMessage(targetGroupId: Number, content: Buffer | String, opts?: Object): Promise<Object>;
    public sendPrivateMessage(sourceSubscriberId: Number, content: Buffer | String, opts?: Object): Promise<Object>;
    public sendMessage(commandOrMessage: Object, content: Buffer | String, opts?: Object): Promise<Object>;
    public acceptPrivateMessageRequest(subscriberId :Number): Promise<Object>;
    public deleteGroupMessage(targetGroupId: Number, timestamp: Number): Promise<Object>;
    public restoreGroupMessage(targetGroupId: Number, timestamp: Number): Promise<Object>;
    public getGroupMessageEditHistory(targetGroupId: Number, timestamp: Number): Promise<Object>;
    public subscribeToNextMessage(predict: any, timeout?: Number ) : Promise<Object>;
    public subscribeToNextGroupMessage(targetGroupId: Number, timeout?: Number ) : Promise<Object>;
    public subscribeToNextPrivateMessage(sourceSubscriberId: Number, timeout?: Number ) : Promise<Object>;
    public subscribeToNextGroupSubscriberMessage(targetGroupId: Number, sourceSubscriberId: Number, timeout?: Number ) : Promise<Object>;
}
export class NotificationHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(language: Number, requestNew?: Boolean) : Promise<Array<Object>>;
    public clear(): Promise<Object>;
    public subscribe(language: Number): Promise<Object>;
}
export class PhraseHelper extends Helper {
    private constructor(api : WOLFBot);
    public list(includeLocal: Boolean): Array<Object>;
    public count(): Object;
    public clear(): void;
    public load(phrases: Array<Object>): void;
    public getLanguageList(): Array<String>;
    public getAllByName(name: String): Array<Object>;
    public getByLanguageAndName(language: String, Name: string): String;
    public getByCommandAndName(command: Object, Name: string): String;
    public isRequestedPhrase(name: string, value: string): Boolean;
}
export class StageHelper extends Helper {
    private constructor(api : WOLFBot);
    public getSettings(targetGroupId: Number, requestNew?: Boolean): Promise<Object>;
    public getStages(requestNew?: Boolean): Promise<Array<Object>>;
    public getStagesForGroup(targetGroupId: Number, requestNew?: Boolean): Promise<Array<Object>>;
    public getSlots(targetGroupId: Number, requestNew?: Boolean): Promise<Array<Object>>;
    public updateSlotMuteState(targetGroupId: Number, slotId: Number, muted: Boolean): Promise<Object>;
    public updateSlotLockState(targetGroupId: Number, slotId: Number, locked: Boolean): Promise<Object>;
    public leaveSlot(targetGroupId: Number): Promise<Object>;
    public removeSubscriberFromSlot(targetGroupId: Number, slotId: Number): Promise<Object>;
    public joinSlot(targetGroupId :Number, slotId: Number, sdp?:String): Promise<Object>;
    public consumeSlot(targetGroupId :Number, slotId: Number, sdp: String): Promise<Object>;
    public play(targetGroupId: Number, data: Readable): Promise<Object>;
    public pause(targetGroupId: Number): Promise<Object>;
    public resume(targetGroupId: Number): Promise<Object>;
    public stop(targetGroupId: Number): Promise<Object>;
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
    private constructor(api: WOLFBot, subscriber: Object);
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
    public save(): Promise<Object>;
}
export class SubscriberHelper extends Helper {
    private constructor(api : WOLFBot);
    public getByIds(sourceSubscriberIds: Number| Array<Number>, requestNew?: Boolean): Promise<Array<Object>>;
    public getById(sourceSubscriberId: Number, requestNew?: Boolean): Promise<Object>;
    public getHistory(sourceSubscriberId: Number, timestamp?: Number, limit?: Number): Promise<Array<Object>>;
}
export class TipHelper extends Helper {
    private constructor(api : WOLFBot);
    public tip(subscriberId: Number, targetGroupId: Number, context: Object, charms: Array<Object>): Promise<Object>;
    public getDetails(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<Object>;
    public getSummary(targetGroupId: Number, timestamp: Number, limit?: Number, offset?: Number): Promise<Object>;
    public getGroupLeaderboard(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<Object>
    public getGroupLeaderboardSummary(targetGroupId: Number, tipPeriod: String, tipType: String, tipDirection: String): Promise<Object>
    public getGlobalLeaderboard (tipPeriod: String, tipType: String, tipDirection?: String): Promise<Object>
    public getGlobalLeaderboardSummary(tipPeriod: String): Promise<Object>
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
    public getRecipeSections(language: Number, requestNew?: boolean): Array<Object>;
}
export class DownloadUtility {
    private constructor(api: WOLFBot);
    public file(url: string): Promise<Buffer>;
}
export class MemberUtility {
    private constructor(api: WOLFBot);
    public get(targetGroupId: Number, sourceSubscriberId: Number): Object;
    public checkPermissions(targetGroupId: Number, sourceSubscriberId: Number, requiredCapability: Number, checkStaff?: Boolean, includeAuthorizedSubscribers?: Number): Promise<Boolean>; 
}
export class GroupUtility{
    private constructor(api: WOLFBot);
    public member(): MemberUtility;
    public getAvatar(subscriberId: Number, size: Number): Promise<Buffer>;
    public toDisplayName(group: Object, excludeId?: Boolean): String;
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
    public replace(string: String, replacements: Object): String;
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
    public toDisplayName(subscriber: Object, trimAds?: Boolean, excludeId?: Boolean): String;
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
    public delay(duration: Number): Promise<any>;
}
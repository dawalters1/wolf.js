
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

    public commandHandler: CommandHandler;

    public achievement: Achivement;
    public authorization: Authorization;
    public banned: Banned;
    public blocked: Blocked;
    public charm: Charm;
    public contact: Contact;
    public discovery: Discovery;
    public event: Event;
    public group: Group;
    public messaging: Messaging;
    public notification: Notification;
    public phrase: Phrase;
    public stage: Stage;
    public store: Store;
    public subscriber: Subscriber;
    /**
    * @deprecated Will be removed in 21.0
    * @use {@link tipping}
    */
    public tip: Tipping;
    public tipping: Tipping;

    public setSelectedCharms(charms: )//TODO;
}
//#endregion
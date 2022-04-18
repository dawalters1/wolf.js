

//#region  Models

export class GroupAudio{
    public id: Number;
    public enabled: Boolean;
    public minRepLevel: Number;
    public stageId: Number|undefined;
    public consumerCount: Number;
    public broadcasterCount: Number;
}

export class GroupAudioCounts {
    public id: Number;
    public consumerCount: Number;
    public broadcasterCount: Number;
}

export class GroupAudioSlot{
    public id: Number;
    public locked: Boolean;
    public occupierId: Number|undefined;
    public occupierMuted: Boolean;
    public uuid: String;
    public connectionState: String;

    public reservedExpiresAt: Date;
    public reservedOccupierId: Number;
}

export class AudioStage{
    public id: Number;
    public name: String;
    public schemaUrl: String;
    public imageUrl: String;
    public productId: Number
}

export class Achievement{

}

export class Charm {
    public cost: Number;
    public descriptionList: Array<LanguageText>
    public descriptionPhraseId: Number;
    public id: Number;
    public imageUrl: String;
    public name: String;
    public nameTranslationList: Array<LanguageText>;
    public productId: Number;
    public weight: Number;
}

export class CharmSubscriberSummary {
    public charmId: Number;
    public expireTime: Date;
    public total: Number;
    public giftCount: Number;
}

export class CharmSubscriberStatus {
    public charmId: Number;
    public expireTime: Date|undefined;
    public id: Number;
    public sourceSubscriberId: Number|undefined;
    public subscriberId: Number;
}

export class LanguageText{
    public languageId: Number;
    public text: String;
}

export class BaseMessage{
    public id: String;
    public data: any;
    public isGroup: Boolean;
    public metadata: MessageMetadata;
    public edited: MessageEdit;
    public mimeType: String;
    public originator: {
        id: Number;
    }
    public recipient: {
        id: Number;
    }
    public timestamp: Number;
}

export class Message {
    public id: String;
    public isGroup: Boolean;
    public metadata: MessageMetadata;
    public edited: MessageEdit;
    public mimeType: String;
    public sourceSubscriberId: Number;
    public targetGroupId: Number;
    public timestamp: Number;
}

export class MessageEdit {
    public subscriberId: Number;
    public timestamp: Number;
}

export class MessageMetadata {
    public isDeleted: Boolean;
    public isSpam: Boolean;
    public isTipped: Boolean;
    public formatting: MessageFormatting;
    public imp: MessageFormattingIMP;
}

export class MessageFormatting{
    public links: Array<MessageFormattingLink>;
    public groupLinks: Array<MessageFormattingAd>;
}

export class MessageFormattingAd {
    public start: Number;
    public end: Number;
    public groupId: Number;
}

export class MessageFormattingLink{
    public start: Number;
    public end: Number;
    public url: String;
}

export class MessageFormattingIMP{
    public aspectRation: {
        string: String;
        decimal: Number;
    }
}

//#endregion
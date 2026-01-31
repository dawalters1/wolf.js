import BaseEvent from './BaseEvent.js';
import { Language, MessageType } from '../../../constants/index.js';
import Message from '../../../entities/Message.js';

export default class MessageEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message send');
  }

  async process (data) {
    const message = new Message(this.client, data);
    if (message.sourceUserId === this.client.me?.id && this.client.config.framework.messages.ignore.self) { return; }

    switch (message.mimeType) {
      case MessageType.PM_REQUEST_RESPONSE:
        return this.client.emit(
          'userPrivateMessageAccept',
          { userId: message.sourceUserId }
        );
      case MessageType.INTERACTIVE_MESSAGE_PACK:
        message.body = message.body
          .replace('token=TOKEN', `token=${this.client.config.framework.login.token}`)
          .replace('language=LANGUAGE', `language=${this.client.me && this.client.me.extended
            ? this.client.me.extended.language
            : Language.ENGLISH} `)
          .replace('platform=PLATFORM', `platform=${this.client.config.framework.connection.query.device}`) // Replaces deviceType
          .replace('deviceType=DEVICETYPE', 'deviceType=wjs');
        break;
      default:
        break;
    }

    const events = [message.isChannel
      ? 'channelMessage'
      : 'privateMessage', 'message'];

    return events.map((event) =>
      this.client.emit(event, message)
    );
  }
}

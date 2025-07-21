import BaseEvent from './baseEvent.js';
import { Language, MessageType } from '../../../constants/index.js';
import { Message } from '../../../entities/message.js';

class MessageEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message send');
  }

  async process (data) {
    const message = new Message(this.client, data);
    if (message.sourceUserId === this.client.me?.id && this.client.config.framework.messages.ignore.self) { return; }

    switch (message.mimeType) {
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

    events.forEach((event) =>
      this.client.emit(event, message)
    );
  }
}

export default MessageEvent;

import BaseEvent from './baseEvent';
import { Language, MessageType } from '../../../constants';
import { Message, ServerMessage } from '../../../structures/message';
import WOLF, { Events } from '../../WOLF';

class MessageEvent extends BaseEvent<ServerMessage> {
  static ArgClass = Message;
  constructor (client: WOLF) {
    super(client, 'message send');
  }

  async process (data: ServerMessage): Promise<void> {
    const message = new Message(this.client, data);
    // if (message.sourceUserId === this.client.me?.id && this.client.config.framework.messages.ignore.self) { return; }

    switch (message.mimeType) {
      case MessageType.INTERACTIVE_MESSAGE_PACK:
        message.content = message.content
          .replace('token=TOKEN', `token=${this.client.config.framework.login.token}`)
          .replace('language=LANGUAGE', `language=${this.client.me?.extended?.language || Language.ENGLISH} `)
          .replace('platform=PLATFORM', `platform=${this.client.config.framework.connection.query.device}`) // Replaces deviceType
          .replace('deviceType=DEVICETYPE', 'deviceType=Unknown'); // Deprecated
        break;
      default:
        break;
    }

    const events: (keyof Events)[] = [message.isChannel ? 'channelMessage' : 'privateMessage', 'message'];

    events.forEach((event) =>
      this.client.emit(event, message)
    );
  }
}

export default MessageEvent;

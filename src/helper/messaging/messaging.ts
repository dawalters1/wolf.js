import { Command } from '../../constants/Command';
import WOLF from '../../client/WOLF';

class MessagingHelper {
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async _subscribeToChannel (channelId?: number | number[]) {
    const requestBody: any = {
      headers: {
        version: 4
      }
    };

    if (channelId) {
      requestBody.body = {
        idList: Array.isArray(channelId) ? channelId : [channelId]
      };
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_SUBSCRIBE,
      requestBody
    );
  }

  async _subscribeToPrivate () {
    return await this.client.websocket.emit(
      Command.MESSAGE_PRIVATE_SUBSCRIBE,
      {
        headers: {
          version: 2
        }
      }
    );
  }
}

export default MessagingHelper;

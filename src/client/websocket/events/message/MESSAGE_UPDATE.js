import { Event, ServerEvent } from '../../../../constants/index.js';
import models from '../../../../models/index.js';
import Base from '../Base.js';

/**
 * @param {import('../../../WOLF.js').default} this.client
 */
class MessageUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.MESSAGE_UPDATE);
  }

  async process (body) {
    (body.isGroup ? [Event.GROUP_MESSAGE_UPDATE, Event.CHANNEL_MESSAGE_UPDATE] : [Event.PRIVATE_MESSAGE_UPDATE])
      .forEach((event) =>
        this.client.emit(
          event,
          new models.Message(this.client, body)
        )
      );
  }
}

export default MessageUpdate;

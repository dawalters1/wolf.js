import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_UPDATE);
  }

  async process (body) {
    const cached = this.client.channel.channels.find((channel) => channel.id === body.id);

    if (!cached || cached.hash === body.hash) { return false; }

    const oldChannel = new models.Channel(this.client, cached);
    const newChannel = await this.client.channel.getById(body.id, true, true);

    return [Event.GROUP_UPDATE, Event.CHANNEL_UPDATE]
      .forEach((event) =>
        this.client.emit(
          event,
          oldChannel,
          newChannel
        )
      );
  };
}
export default GroupUpdate;

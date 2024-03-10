import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupEventCreate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_EVENT_CREATE);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.channelId);

    if (!channel) { return false; }

    const event = await this.client.event.getById(body.id);

    channel._events.list.push(event);

    return [Event.GROUP_EVENT_CREATE, Event.CHANNEL_EVENT_CREATE]
      .forEach((event) =>
        this.client.emit(
          event,
          channel,
          event
        )
      );
  };
}
export default GroupEventCreate;

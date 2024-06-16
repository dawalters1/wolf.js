import { Event, ServerEvent } from '../../../../../constants/index.js';
import patch from '../../../../../utils/patch.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupEventUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_EVENT_UPDATE);
  }

  async process (body) {
    const channel = await this.client.channel.getById(body.channelId);
    const oldEvent = channel._events.list.find((event) => event.id === body.id);

    if (!oldEvent) { return false; }

    const newEvent = await this.client.event.getById(body.id, true);

    if (body.isRemoved) {
      channel.events = channel.events.filter((event) => event.id !== body.id);

      return [Event.GROUP_EVENT_DELETE, Event.CHANNEL_EVENT_DELETE]
        .forEach((event) =>
          this.client.emit(
            event,
            channel,
            newEvent
          )
        );
    }

    patch(oldEvent, newEvent);

    return [Event.GROUP_EVENT_UPDATE, Event.CHANNEL_EVENT_UPDATE]
      .forEach((event) =>
        this.client.emit(
          event,
          channel,
          oldEvent,
          newEvent
        )
      );
  };
}
export default GroupEventUpdate;

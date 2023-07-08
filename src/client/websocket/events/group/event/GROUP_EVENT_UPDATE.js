import { Event } from '../../../../../constants/index.js';
import patch from '../../../../../utils/patch.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = await client.channel.getById(body.channelId);
  const oldEvent = channel.events.find((event) => event.id === body.id);

  if (!oldEvent) {
    return Promise.resolve();
  }

  const newEvent = await client.event.getById(body.id, true);

  if (body.isRemoved) {
    channel.events.splice(channel.events.indexOf(oldEvent), 1);

    return [Event.GROUP_EVENT_DELETE, Event.CHANNEL_EVENT_DELETE]
      .forEach((event) =>
        client.emit(
          event,
          channel,
          newEvent
        )
      );
  }
  patch(oldEvent, newEvent);

  return [Event.GROUP_EVENT_UPDATE, Event.CHANNEL_EVENT_UPDATE]
    .forEach((event) =>
      client.emit(
        event,
        channel,
        oldEvent,
        newEvent
      )
    );
};

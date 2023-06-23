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

    return client.emit(
      Event.GROUP_EVENT_DELETE,
      channel,
      newEvent
    );
  }
  patch(oldEvent, newEvent);

  return client.emit(
    Event.GROUP_EVENT_UPDATE,
    channel,
    oldEvent,
    newEvent
  );
};

import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((channel) => channel.id === body.channelId);

  if (!channel) {
    return Promise.resolve();
  }

  const event = await client.event.getById(body.id);

  channel.events.push(event);

  return [Event.GROUP_EVENT_CREATE, Event.CHANNEL_EVENT_CREATE]
    .forEach((event) =>
      client.emit(
        event,
        channel,
        event
      )
    );
};

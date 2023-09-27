import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const cached = client.channel.channels.find((channel) => channel.id === body.id);

  if (!cached || cached.hash === body.hash) { return false; }

  const oldChannel = new models.Channel(client, cached);
  const newChannel = await client.channel.getById(body.id, true, true);

  return [Event.GROUP_UPDATE, Event.CHANNEL_UPDATE]
    .forEach((event) =>
      client.emit(
        event,
        oldChannel,
        newChannel
      )
    );
};

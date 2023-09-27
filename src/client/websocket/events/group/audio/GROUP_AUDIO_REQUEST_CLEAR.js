import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((channel) => channel.id === body.groupId);

  if (!channel) { return false; }
  channel.audioRequests = [];

  return [Event.GROUP_AUDIO_REQUEST_CLEAR, Event.CHANNEL_AUDIO_REQUEST_CLEAR]
    .forEach((event) =>
      client.emit(
        event,
        channel,
        body.subscriberId
      )
    );
};

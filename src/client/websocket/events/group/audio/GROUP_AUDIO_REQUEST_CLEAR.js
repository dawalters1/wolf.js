import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((channel) => channel.id === body.groupId);

  if (!channel) {
    return Promise.resolve();
  }
  channel.audioRequests = [];

  return client.emit(
    Event.GROUP_AUDIO_REQUEST_CLEAR,
    channel,
    body.subscriberId
  );
};

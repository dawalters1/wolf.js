import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((channel) => channel.id === body.groupId);

  if (!channel) {
    return Promise.resolve();
  }

  const cached = channel.audioRequests.find((request) => request.subscriberId === body.subscriberId);

  if (!cached) {
    return Promise.resolve();
  }

  const request = new models.ChannelAudioSlotRequest(client, body);

  channel.audioRequests.splice(channel.audioRequests.indexOf(request), 1);

  return client.emit(
    new Date(cached.reservedExpiresAt).getTime() >= Date.now()
      ? Event.GROUP_AUDIO_REQUEST_EXPIRE
      : Event.GROUP_AUDIO_REQUEST_DELETE,
    channel,
    request
  );
};

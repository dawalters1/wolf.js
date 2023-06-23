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

  const request = new models.ChannelAudioSlotRequest(client, body);

  channel.audioRequests.push(request);

  return client.emit(
    Event.GROUP_AUDIO_REQUEST_ADD,
    channel,
    request
  );
};

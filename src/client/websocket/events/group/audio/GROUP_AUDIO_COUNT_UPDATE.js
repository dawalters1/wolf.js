import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((channel) => channel.id === body.id);

  if (!channel) {
    return Promise.resolve();
  }

  const oldAudioCount = new models.ChannelAudioCounts(client, channel.audioCounts);

  channel.audioCounts = new models.ChannelAudioCounts(client, body);

  return client.emit(
    Event.GROUP_AUDIO_COUNT_UPDATE,
    oldAudioCount,
    channel.audioCounts
  );
};

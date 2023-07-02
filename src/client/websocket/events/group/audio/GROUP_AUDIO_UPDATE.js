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

  const oldAudioConfig = new models.ChannelAudioConfig(client, channel.audioConfig);

  channel.audioConfig = new models.ChannelAudioConfig(client, body);

  return [Event.GROUP_AUDIO_UPDATE, Event.CHANNEL_AUDIO_UPDATE]
    .forEach((event) =>
      client.emit(
        event,
        oldAudioConfig,
        channel.audioConfig
      )
    );
};

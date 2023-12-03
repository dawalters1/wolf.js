import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupAudioUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_UPDATE);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.id);

    if (!channel) { return false; }

    const oldAudioConfig = new models.ChannelAudioConfig(this.client, channel.audioConfig);

    channel.audioConfig = new models.ChannelAudioConfig(this.client, body);

    return [Event.GROUP_AUDIO_UPDATE, Event.CHANNEL_AUDIO_UPDATE]
      .forEach((event) =>
        this.client.emit(
          event,
          oldAudioConfig,
          channel.audioConfig
        )
      );
  };
}
export default GroupAudioUpdate;

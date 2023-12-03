import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

class GroupAudioCountUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_COUNT_UPDATE);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.id);

    if (!channel) { return false; }

    const oldAudioCount = new models.ChannelAudioCounts(this.client, channel.audioCounts);

    channel.audioCounts = new models.ChannelAudioCounts(this.client, body);

    return [Event.GROUP_AUDIO_COUNT_UPDATE, Event.CHANNEL_AUDIO_COUNT_UPDATE]
      .forEach((event) =>
        this.client.emit(
          event,
          oldAudioCount,
          channel.audioCounts
        )
      );
  }
}

export default GroupAudioCountUpdate;

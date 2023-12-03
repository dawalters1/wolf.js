import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupAudioRequestClear extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_REQUEST_CLEAR);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.groupId);

    if (!channel) { return false; }
    channel.audioRequests = [];

    return [Event.GROUP_AUDIO_REQUEST_CLEAR, Event.CHANNEL_AUDIO_REQUEST_CLEAR]
      .forEach((event) =>
        this.client.emit(
          event,
          channel,
          body.subscriberId
        )
      );
  };
}
export default GroupAudioRequestClear;

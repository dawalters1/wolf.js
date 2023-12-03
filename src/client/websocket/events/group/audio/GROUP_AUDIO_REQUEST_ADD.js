import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupAudioRequestAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_REQUEST_ADD);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.groupId);

    if (!channel) { return false; }

    const request = new models.ChannelAudioSlotRequest(this.client, body);

    channel.audioRequests.push(request);

    return [Event.GROUP_AUDIO_REQUEST_ADD, Event.CHANNEL_AUDIO_REQUEST_ADD]
      .forEach((event) =>
        this.client.emit(
          event,
          channel,
          request
        )
      );
  };
}
export default GroupAudioRequestAdd;

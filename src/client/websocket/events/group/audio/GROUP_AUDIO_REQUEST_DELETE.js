import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupAudioRequestDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_REQUEST_DELETE);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((channel) => channel.id === body.groupId);

    if (!channel) { return false; }

    const cached = channel.audioRequests.find((request) => request.subscriberId === body.subscriberId);

    if (!cached) { return false; }

    const request = new models.ChannelAudioSlotRequest(this.client, body);

    channel.audioRequests = channel.audioRequests.filter((request) => request.subscriberId !== body.subscriberId);

    return (new Date(cached.reservedExpiresAt).getTime() >= Date.now()
      ? [Event.GROUP_AUDIO_REQUEST_EXPIRE, Event.CHANNEL_AUDIO_REQUEST_EXPIRE]
      : [Event.GROUP_AUDIO_REQUEST_DELETE, Event.CHANNEL_AUDIO_REQUEST_DELETE])
      .forEach((event) =>
        this.client.emit(
          event,
          channel,
          request
        )
      );
  };
}
export default GroupAudioRequestDelete;

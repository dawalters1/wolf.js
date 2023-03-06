import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const group = client.group.groups.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  const request = new models.GroupAudioSlotRequest(client, body);

  group.audioRequests.push(request);

  return client.emit(
    Event.GROUP_AUDIO_REQUEST_ADD,
    group,
    request
  );
};

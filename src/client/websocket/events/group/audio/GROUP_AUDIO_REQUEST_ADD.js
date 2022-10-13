import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

export default async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.groupId);

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

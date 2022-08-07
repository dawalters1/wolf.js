import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
export default async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.groupId);
  if (!group) {
    return Promise.resolve();
  }
  const cached = group.audioRequests.find((request) => request.subscriberId === body.subscriberId);
  if (!cached) {
    return Promise.resolve();
  }
  const request = new models.GroupAudioSlotRequest(client, body);
  group.audioRequests.splice(group.audioRequests.indexOf(request), 1);
  return client.emit(new Date(cached.reservedExpiresAt).getTime() >= Date.now() ? Event.GROUP_AUDIO_REQUEST_EXPIRE : Event.GROUP_AUDIO_REQUEST_DELETE, group, request);
};

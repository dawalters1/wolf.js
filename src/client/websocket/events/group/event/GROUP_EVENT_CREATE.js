import { Event } from '../../../../../constants/index.js';
export default async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.groupId);
  if (!group) {
    return Promise.resolve();
  }
  const event = await client.event.getById(body.id);
  group.events.push(event);
  return client.emit(Event.GROUP_EVENT_CREATE, group, event);
};

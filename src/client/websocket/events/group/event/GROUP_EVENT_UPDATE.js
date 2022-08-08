import { Event } from '../../../../../constants/index.js';
import patch from '../../../../../utils/patch.js';

export default async (client, body) => {
  const group = await client.group.getById(body.groupId);
  const oldEvent = group.events.find((event) => event.id === body.id);

  if (!oldEvent) {
    return Promise.resolve();
  }

  const newEvent = await client.event.getById(body.id, true);

  if (body.isRemoved) {
    group.events.splice(group.events.indexOf(oldEvent), 1);

    return client.emit(Event.GROUP_EVENT_DELETE, group, newEvent);
  }
  patch(oldEvent, newEvent);

  return client.emit(Event.GROUP_EVENT_UPDATE, group, oldEvent, newEvent);
};

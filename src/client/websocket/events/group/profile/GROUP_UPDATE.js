import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
export default async (client, body) => {
  const cached = client.group.cache.find((group) => group.id === body.id);
  if (!cached || cached.hash === body.hash) {
    return Promise.resolve();
  }
  const oldGroup = new models.Group(client, cached);
  const newGroup = await client.group.getById(body.id, true);
  return client.emit(Event.GROUP_UPDATE, oldGroup, newGroup);
};

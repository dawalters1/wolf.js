import { Event } from '../../../../constants/index.js';
import models from '../../../../models/index.js';

export default async (client, body) => {
  return client.emit(body.isGroup || body.groupId ? Event.GROUP_TIP_ADD : Event.PRIVATE_TIP_ADD, new models.Tip(client, body));
};

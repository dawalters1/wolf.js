import { Event } from '../../../../constants/index.js';
import models from '../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => client.emit(
  body.isGroup || body.groupId
    ? Event.GROUP_TIP_ADD
    : Event.PRIVATE_TIP_ADD,
  new models.Tip(client, body)
);
